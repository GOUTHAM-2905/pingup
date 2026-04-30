import { Inngest } from "inngest";
import User from "../models/User.js";
import sendEmail from "../configs/nodeMailer.js";
import Connection from "../models/Connections.js";
import Story from "../models/Story.js";
import Message from "../models/Message.js";

export const inngest = new Inngest({ id: "pingup-app" });

const syncUserCreation = inngest.createFunction(
  {
    id: "sync-user-from-clerk",
    triggers: { event: "clerk/user.created" },
  },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;

    let username = email_addresses[0].email_address.split("@")[0];
    let user = await User.findOne({ username });

    while (user) {
      username = username + Math.floor(Math.random() * 10000);
      user = await User.findOne({ username });
    }

    const userdata = {
      _id: id,
      email: email_addresses[0].email_address,
      full_name: first_name + " " + last_name,
      profile_picture: image_url,
      username,
    };

    await User.create(userdata);
  }
);

const syncUserUpdation = inngest.createFunction(
  {
    id: "update-user-from-clerk",
    triggers: { event: "clerk/user.updated" },
  },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;

    const updateUserData = {
      email: email_addresses[0].email_address,
      full_name: first_name + " " + last_name,
      profile_picture: image_url,
    };

    await User.findByIdAndUpdate(id, updateUserData);
  }
);

const syncUserDeletion = inngest.createFunction(
  {
    id: "delete-user-from-clerk",
    triggers: { event: "clerk/user.deleted" },
  },
  async ({ event }) => {
    const { id } = event.data;
    await User.findByIdAndDelete(id);
  }
);

// innjest function to send email that new connection request is sent 
const sendNewConnectionRequestReminder = inngest.createFunction(
  {
    id: "send-new-connection-request-reminder",
    triggers: [{ event: "app/connection-request" }] // ✅ correct placement
  },
  async ({ event, step }) => {
    // ✅ safe extraction
    const connectionId = event.data?.connectionId || event.data;

    // 🔹 STEP 1: Send initial email
    await step.run("send-connection-request-email", async () => {
      const connection = await Connection.findById(connectionId)
        .populate("from_user_id to_user_id");

      if (!connection) {
        throw new Error("Connection not found");
      }

      // ❌ don't send if already accepted
      if (connection.status === "accepted") {
        return { message: "Already connected" };
      }

      const subject = "👋 New Connection Request";

      const body = `
      <div style="font-family: Arial, Helvetica, sans-serif; padding: 20px">
        <h2>Hi ${connection.to_user_id.full_name},</h2>
        <p>
          You have a new connection request from 
          ${connection.from_user_id.full_name} - @${connection.from_user_id.username}
        </p>
        <p>
          Click <a href="${process.env.FRONTEND_URL}/connections">
          here</a> to accept or reject the request
        </p>
        <br>
        <p>Thanks,<br/>PingUp - Stay Connected</p>
      </div>`;

      await sendEmail({
        to: connection.to_user_id.email,
        subject,
        body
      });

      return { message: "Initial email sent" };
    });

    // 🔹 STEP 2: Wait 24 hours
    const in24Hours = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await step.sleepUntil("wait-for-24-hours", in24Hours);

    // 🔹 STEP 3: Send reminder email
    await step.run("send-connection-reminder-email", async () => {
      const connection = await Connection.findById(connectionId)
        .populate("from_user_id to_user_id");

      if (!connection) {
        throw new Error("Connection not found");
      }

      if (connection.status === "accepted") {
        return { message: "Already connected" };
      }

      const subject = "👋 Reminder: Connection Request";

      const body = `
      <div style="font-family: Arial, Helvetica, sans-serif; padding: 20px">
        <h2>Hi ${connection.to_user_id.full_name},</h2>
        <p>
          You still have a connection request from 
          ${connection.from_user_id.full_name}
        </p>
        <p>
          Click <a href="${process.env.FRONTEND_URL}/connections">
          here</a> to respond
        </p>
        <br>
        <p>Thanks,<br/>PingUp</p>
      </div>`;

      await sendEmail({
        to: connection.to_user_id.email,
        subject,
        body
      });

      return { message: "Reminder email sent" };
    });

    return { message: "Reminder workflow completed" };
  }
);

const deleteStory = inngest.createFunction(
    {
        id: "delete-story",
        triggers: [{ event: "app/story.delete" }] // ✅ FIXED
    },
    async ({ event, step }) => {
        const { storyId } = event.data;

        // schedule deletion exactly 24 hours later
        const deleteAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await step.sleepUntil("wait-for-24-hours", deleteAt);

        return await step.run("story-delete", async () => {
            const deleted = await Story.findByIdAndDelete(storyId);
            if (!deleted) {
                return { message: "Story already deleted or not found" };
            }
            return { message: "Story deleted successfully" };
        });
    }
);

const sendNotificationOfUnseenMessages = inngest.createFunction(
    {
        id: "send-unseen-message-notification",
        triggers: [
            { cron: "CRON_TZ=Asia/Kolkata 0 9 * * *" }
        ]
    },
    async ({ step }) => {
        const messages = await Message
            .find({ seen: false })
            .populate("to_user_id");

        const unseenCount = {};

        messages.forEach((message) => {
            const userId = message.to_user_id._id.toString();
            unseenCount[userId] = (unseenCount[userId] || 0) + 1;
        });

        for (const userId in unseenCount) {
            const user = await User.findById(userId);

            const subject = `You have ${unseenCount[userId]} unseen messages`;

            const body = `
                <div style="font-family: Arial; padding: 20px">
                    <h2>Hi ${user.full_name},</h2>
                    <p>You have ${unseenCount[userId]} unseen messages</p>
                    <p>
                        Click 
                        <a href="${process.env.FRONTEND_URL}/messages">
                        here
                        </a> to view them
                    </p>
                    <br>
                    <p>Thanks,<br/>PingUp</p>
                </div>
            `;

            await sendEmail({
                to: user.email,
                subject,
                body
            });
        }

        return { message: "Notification Sent." };
    }
);
// ✅ export
export const functions = [
  syncUserCreation,
  syncUserUpdation,
  syncUserDeletion,
  sendNewConnectionRequestReminder,
  deleteStory,
  sendNotificationOfUnseenMessages
];





