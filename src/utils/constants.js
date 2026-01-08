// App Constants
export const APP_NAME = 'PeerFlow';
export const CAMPUS_DOMAIN = 'nitp.ac. in';

// Product Categories
export const PRODUCT_CATEGORIES = [
  { id:  'electronics', name: 'Electronics', icon: '📱' },
  { id: 'books', name: 'Books & Notes', icon: '📚' },
  { id: 'furniture', name: 'Furniture', icon: '🪑' },
  { id: 'clothing', name: 'Clothing', icon: '👕' },
  { id: 'sports', name: 'Sports & Fitness', icon: '⚽' },
  { id: 'stationery', name:  'Stationery', icon: '✏️' },
  { id: 'accessories', name: 'Accessories', icon:  '🎒' },
  { id: 'other', name: 'Other', icon: '📦' },
];

// Product Conditions
export const PRODUCT_CONDITIONS = [
  { id:  'new', name: 'Brand New', description: 'Unused, in original packaging' },
  { id: 'like_new', name:  'Like New', description: 'Used once or twice, excellent condition' },
  { id: 'good', name: 'Good', description: 'Used but well maintained' },
  { id: 'fair', name: 'Fair', description: 'Shows signs of wear but fully functional' },
];

// Skill Categories
export const SKILL_CATEGORIES = [
  { id:  'academics', name: 'Academics', icon: '📖' },
  { id: 'tech', name: 'Technology', icon: '💻' },
  { id: 'arts', name: 'Arts & Design', icon: '🎨' },
  { id: 'music', name: 'Music', icon: '🎵' },
  { id:  'sports', name: 'Sports', icon: '🏃' },
  { id: 'languages', name: 'Languages', icon: '🗣️' },
  { id: 'life_skills', name: 'Life Skills', icon: '🌟' },
  { id: 'other', name: 'Other', icon:  '✨' },
];

// Proficiency Levels
export const PROFICIENCY_LEVELS = [
  { id:  'beginner', name: 'Beginner', description: '0-1 years experience' },
  { id: 'intermediate', name: 'Intermediate', description: '1-3 years experience' },
  { id:  'advanced', name: 'Advanced', description: '3-5 years experience' },
  { id: 'expert', name: 'Expert', description: '5+ years experience' },
];

// Time Preferences
export const TIME_PREFERENCES = [
  { id: 'morning', name:  'Morning', time: '6 AM - 12 PM' },
  { id: 'afternoon', name: 'Afternoon', time: '12 PM - 5 PM' },
  { id: 'evening', name:  'Evening', time: '5 PM - 9 PM' },
  { id: 'night', name:  'Night', time: '9 PM - 12 AM' },
];

// Hostels at NIT Patna
export const HOSTELS = [
  { id: 'sbh', name: 'Sone Boys Hostel' },
  { id: 'gbh', name: 'Ganga Boys Hostel' },
  { id:  'kbh', name: 'Kosi Boys Hostel' },
  { id: 'mbh', name: 'Mandakini Boys Hostel' },
  { id: 'nbh', name: 'New Boys Hostel' },
  { id: 'gh', name: 'Girls Hostel' },
  { id:  'ngh', name: 'New Girls Hostel' },
  { id: 'fq', name: 'Faculty Quarters' },
  { id: 'other', name: 'Other' },
];

// Order Statuses - Updated for P2P Campus Meetup Flow
export const ORDER_STATUSES = {
  payment_required: { name: 'Payment Required', color: 'orange', icon:  '💳' },
  pending: { name: 'Pending Payment', color: 'yellow', icon: '⏳' },
  confirmed: { name: 'Payment Confirmed', color:  'blue', icon: '✓' },
  waiting_for_meetup: { name: 'Awaiting Meetup', color: 'purple', icon: '📍' },
  seller_confirmed: { name: 'Seller Handed Over', color: 'orange', icon: '🤝' },
  completed: { name:  'Completed', color: 'green', icon: '✅' },
  cancelled: { name:  'Cancelled', color: 'red', icon: '❌' },
};

// Payment Statuses
export const PAYMENT_STATUSES = {
  paid: { name: 'Paid', color: 'green', icon: '✅' },
  pending: { name: 'Pending', color: 'yellow', icon: '⏳' },
  unpaid_cash:  { name: 'Cash on Meetup', color: 'blue', icon:  '💵' },
};

// Meetup Locations at NIT Patna
export const MEETUP_LOCATIONS = [
  { id: 'main_gate', name: 'Main Gate' },
  { id: 'library', name: 'Central Library' },
  { id: 'canteen', name: 'Main Canteen' },
  { id:  'sbh_gate', name: 'Sone Hostel Gate' },
  { id: 'gbh_gate', name: 'Ganga Hostel Gate' },
  { id: 'academic_block', name: 'Academic Block Entrance' },
  { id: 'sports_complex', name: 'Sports Complex' },
  { id: 'other', name:  'Other (Specify in notes)' },
];

// Barter Request Statuses
export const BARTER_STATUSES = {
  pending:  { name: 'Pending', color:  'yellow', icon: '⏳' },
  accepted: { name: 'Accepted', color: 'green', icon: '✓' },
  in_progress: { name: 'In Progress', color: 'blue', icon: '🔄' },
  completed: { name: 'Completed', color: 'green', icon:  '✅' },
  cancelled: { name: 'Cancelled', color: 'red', icon:  '❌' },
  rejected: { name: 'Rejected', color: 'red', icon: '✗' },
};

// Payment Methods
export const PAYMENT_METHODS = [
  { id: 'cash', name:  'Cash on Meetup', icon:  '💵' },
  { id:  'upi', name: 'UPI Payment', icon: '📱' },
  { id: 'card', name: 'Credit/Debit Card', icon:  '💳' },
];

// Error Messages
export const ERROR_MESSAGES = {
  'auth/email-already-in-use': 'This email is already registered.  Please login instead.',
  'auth/invalid-email':  'Please enter a valid email address.',
  'auth/weak-password': 'Password should be at least 6 characters.',
  'auth/user-not-found': 'No account found with this email.',
  'auth/wrong-password': 'Incorrect password.  Please try again.',
  'auth/too-many-requests':  'Too many failed attempts. Please try again later.',
  'auth/network-request-failed': 'Network error. Please check your connection.',
  default: 'An error occurred. Please try again.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  signup: 'Account created successfully! Please verify your email.',
  login: 'Welcome back! ',
  logout:  'You have been logged out.',
  product_created: 'Product listed successfully! ',
  product_updated: 'Product updated successfully!',
  product_deleted:  'Product deleted successfully!',
  skill_created: 'Skill posted successfully! ',
  skill_updated: 'Skill updated successfully!',
  order_created: 'Order placed successfully!',
  order_created_cash: 'Order confirmed!  Please prepare cash for the meetup.',
  profile_updated: 'Profile updated successfully!',
  barter_request_sent: 'Barter request sent successfully! ',
  seller_confirmed: 'Item handed over! Waiting for buyer confirmation.',
  buyer_confirmed:  'Item received!  Order completed successfully.',
};