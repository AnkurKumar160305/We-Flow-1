import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  workspaceId: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    default: 'Bell', // Matches the lucide-react icons used in frontend
  },
  color: {
    type: String,
    default: 'text-primary',
  }
});

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
