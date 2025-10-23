# Executive Summary

RPG Todo is a task management application enhanced with RPG elements, designed to increase user engagement and productivity. Users earn experience points (XP) by completing tasks, level up, unlock achievements, and customize their task management experience. This PRD defines the features and technical specifications required for the application's development using React, Express, Shadcn, TailwindCSS, and Supabase.

# Platforms

- **Web**: React
- **Backend**: Express
- **UI/UX**: Shadcn
- **UI/UX**: TailwindCSS
- **Database**: Supabase
- **Server**: Vercel

# User Types

- **Guest**: A potential user of the system who's only abilities are to register and login.
- **User**: A full user of the system who is able to utilise the system and all of the features

# Feature Groups

- Uncategorised
- Rewards & Achievements
- Task Management
- User Account & Profile
- Gamification & Progression
- Data Persistence & Storage
- User Interface & Experience

# Feature Specifications

### Uncategorised

- **Tasks**: The application will include links to the Terms of Service and Privacy Policy, accessible within the app's settings. Clicking these links will open the respective documents in a new browser tab.
- **Potential Dependencies**:
    - User Interface & Experience: Requires a settings section within the UI to house the links.

### Rewards & Achievements

- **Tasks**:
    - Users will earn achievements for completing specific milestones: 10 tasks ("Novice"), 25 tasks ("Apprentice"), 50 tasks ("Taskmaster"), and 100 tasks ("Grandmaster").
    - Level-based achievements will be awarded upon reaching levels 5 ("Journeyman"), 10 ("Expert"), 15 ("Master"), and 20 ("Legend").
    - An achievement ("Efficiency Master") will be granted for completing all urgent tasks within a single week.
    - A small amount of XP (5 XP) will be awarded upon successful registration, and a smaller amount (2 XP) will be awarded for each daily login.
    - Upon unlocking an achievement, the system will update the achievement table in Supabase with a timestamp.
    - Achievement progress will be tracked and visually displayed to the user.
    - Users will receive a non-intrusive notification upon unlocking an achievement.
    - When an achievement is unlocked, the user should get a success message.
- **Potential Dependencies**:
    - Gamification & Progression: Requires the XP and leveling system to be in place.
    - User Interface & Experience: Requires the Achievements section in the UI.
    - Data Persistence & Storage: Requires persisting achievement progress and unlocked achievements.
    - User Account & Profile: Requires access to user profile data to track task completion and level.

### Task Management

- **Tasks**:
    - Users will be able to create new tasks by providing a title, description, due date, priority (Low, Medium, High, Urgent), and optionally assigning a custom label. The system will automatically assign XP based on the task's priority.
    - Users can edit and delete existing tasks.
    - The system will validate all task creation fields before saving.
    - Custom labels can be created, edited, and deleted by the user (limit of 20 per user).
    - Tasks will be displayed in a list, sorted by due date (nearest first) and then by priority (urgent first). Task priority will be visually indicated through color-coding (green for Low, yellow for Medium, orange for High, red for Urgent).
    - Tasks can be marked as complete, awarding the user with the associated XP and updating achievement progress.
    - Users can archive completed or irrelevant tasks, moving them from the main task list to an archive section. Tasks can be moved back from the archive to the main task list.
    - When a task is marked complete the users XP total will be incremented.
- **Potential Dependencies**:
    - Data Persistence & Storage: Requires persisting task data, including title, description, due date, priority, XP value, status (open, completed, archived), and category.
    - User Interface & Experience: Requires Task List and Task Creation sections in the UI.
    - Gamification & Progression: Requires the XP system to be in place to assign and award XP.
    - User Account & Profile: Requires association of tasks with a specific user account.

### User Account & Profile

- **Tasks**:
    - During registration, users will provide a username, email address, and password. The system will validate the input and store the information securely.
    - Users can edit their username after registration. The system will validate the new username to ensure it is unique.
    - The system will store the user's email address, registration date, experience points, level, achievements, and completed task count in their profile. The registration date is automatically captured upon account creation.
- **Potential Dependencies**:
    - Data Persistence & Storage: Requires persisting user profile data, including username, email, password (hashed and salted), registration date, XP, level, achievements, and completed task count.
    - User Interface & Experience: Requires Profile section in the UI with registration, login, and profile editing functionality.
    - Data Persistence & Storage: Requires secure storage of user credentials.

### Gamification & Progression

- **Tasks**:
    - Users will earn XP for completing tasks. The XP value is based on the task's priority: small = 10 XP, medium = 25 XP, large = 50 XP, and urgent = 75 XP. Tasks without a defined difficulty will default to 10 XP.
    - Level progression will be based on cumulative XP, starting at Level 1 with 0 XP.
        - Level 1: 0 XP
        - Level 2: 100 XP
        - Level 3: 250 XP
        - Level 4: 500 XP
        - Level 5: 1000 XP
        - Level 6: 2000 XP
        - Subsequent levels will require exponentially more XP.
    - The maximum attainable level is 100.
    - The user's level and experience points will be displayed in the header, along with a progress bar indicating their progress towards the next level.
    - Users will be awarded 5 XP for registering and 2 XP for daily login.
    - When the user levels up, they should get a notification.
- **Potential Dependencies**:
    - Data Persistence & Storage: Requires persisting user XP, level, and progression data.
    - User Interface & Experience: Requires header section in the UI to display level, XP, and progress bar.
    - User Account & Profile: Requires access to user profiles to update XP and level.

### Data Persistence & Storage

- **Tasks**:
    - All user data, including tasks, profile information, game progress, custom labels, and achievement progress, will be persisted using Supabase.
    - User data will be organized into separate collections for users and tasks, with appropriate indexing for efficient queries (user ID, task status, due date). Pagination will be implemented for task lists to improve performance.
    - Supabase tables:
        - Users table: username, email, password (hashed), registration_date, xp, level, completed_task_count.
        - Tasks table: user_id, title, description, due_date, status (open, completed, archived), xp_value, priority, category.
        - Achievements table: user_id, achievement_name, unlocked_date.
        - Custom_Labels table: user_id, label_name.
    - Tasks will be stored remotely in a cloud-based database on Supabase.
    - Data encryption at rest and in transit will be implemented, adhering to GDPR principles, and obtaining user consent for data collection. Passwords will be stored securely using bcrypt or a similar hashing algorithm. Regular security audits and penetration testing should be performed.
    - Pagination will be implemented for task lists to improve performance. The number of tasks per page should be configurable (e.g., 10, 25, 50).
- **Potential Dependencies**:
    - All features: This feature is a fundamental requirement for all other features that require data persistence.
    - User Account & Profile: Requires storage for user profiles and credentials.
    - Task Management: Requires storage for tasks.
    - Gamification & Progression: Requires storage for XP, level, and achievement data.

### User Interface & Experience

- **Tasks**:
    - The user interface will consist of the following core sections: Task List, Task Creation, Profile, and Achievements.
    - The user's level and experience points will be displayed in the header, and achievement progress will be displayed in a dedicated "Profile" or "Achievements" section. A progress bar will visually represent the user’s experience points toward the next level.
    - Links to the terms of service and privacy policy will be included, opening in a new browser tab.
    - Task priority will be visually indicated using distinct colors: green for Low, yellow for Medium, orange for High, and red for Urgent.
    - Achievement progress will be displayed using progress bars or numerical values.
    - Notifications for achievement unlocks will be non-intrusive and provide positive reinforcement (e.g., a small toast notification).
- **Potential Dependencies**:
    - All features: This feature dictates the overall look and feel of the application and impacts all other features.

# User Experience Requirements

- The application should have a clean and intuitive user interface, making it easy for users to create and manage tasks.
- RPG elements (level, XP, progress bar) should be prominently displayed in the header, providing immediate feedback on user progress.
- Achievement progress and unlocked achievements should be easily accessible in the "Profile" or "Achievements" section.
- Color-coding should be used to visually indicate task priority.
- The task creation flow should be straightforward and efficient.
- The application should be responsive and accessible across different devices.
- The overall experience should be engaging and motivating, encouraging users to complete tasks and progress in the game.
- Use tooltips or help text to explain unfamiliar features or icons.
- Provide clear visual feedback for user actions (e.g., success/error messages).
- Use a consistent design language throughout the application.
- Ensure error messages are clear and helpful, guiding the user on how to resolve the issue.
- Implement keyboard shortcuts for common actions (e.g., creating a task, marking a task as complete).

# Integration Requirements

- Supabase: For user authentication, data storage, and real-time updates.
- Vercel: For serverless deployment and hosting.


---

# User Stories

The following user stories have been generated from the project scope questions and feature groups.

## Data Persistence & Storage

### High Priority

1. **As a user, I want my tasks to be saved with associated information (title, description, due date, status, XP value) so that I can access and manage my tasks with all relevant details.**
   - **Feature Group:** Data Persistence & Storage
   - **Persona:** user
   - **Priority:** high
   - **Related Question:** What types of data will need to be saved for each user (e.g., tasks, profile information, game progress)?
   - **Answer:** Implement user data persistence for tasks (title, description, due date, status, xp value), profile information (username, email, password, registration date), and game progress (experience points, level, achievements, completed task count).
   - **Question Status:** answered
   - **Acceptance Criteria:** Not defined

2. **As a user, I want my todo list, RPG stats, and achievement data to be persistently stored so that I don't lose my progress when I close the app or switch devices.**
   - **Feature Group:** Data Persistence & Storage
   - **Persona:** user
   - **Priority:** high
   - **Related Question:** How often should the data be backed up, and what is the procedure for data recovery?
   - **Answer:** Not provided
   - **Question Status:** not_relevant
   - **Acceptance Criteria:** Not defined

3. **As a user, I want my profile information (username, email, password, registration date) to be securely saved so that I can access and manage my account.**
   - **Feature Group:** Data Persistence & Storage
   - **Persona:** user
   - **Priority:** high
   - **Related Question:** What types of data will need to be saved for each user (e.g., tasks, profile information, game progress)?
   - **Answer:** Implement user data persistence for tasks (title, description, due date, status, xp value), profile information (username, email, password, registration date), and game progress (experience points, level, achievements, completed task count).
   - **Question Status:** answered
   - **Acceptance Criteria:** Not defined

4. **As a user, I want my game progress (experience points, level, achievements, completed task count) to be saved so that I can track my progress and see my achievements.**
   - **Feature Group:** Data Persistence & Storage
   - **Persona:** user
   - **Priority:** high
   - **Related Question:** What types of data will need to be saved for each user (e.g., tasks, profile information, game progress)?
   - **Answer:** Implement user data persistence for tasks (title, description, due date, status, xp value), profile information (username, email, password, registration date), and game progress (experience points, level, achievements, completed task count).
   - **Question Status:** answered
   - **Acceptance Criteria:** Not defined

5. **As a user, I want my custom labels for task categorization to be persisted so that I can effectively organize and filter my tasks.**
   - **Feature Group:** Data Persistence & Storage
   - **Persona:** user
   - **Priority:** high
   - **Related Question:** What types of data need to be persisted, beyond just user and task information?
   - **Answer:** Persist user-defined custom labels for task categorization and achievement progress to track completion status.
   - **Question Status:** answered
   - **Acceptance Criteria:** Not defined

6. **As a user, I want my achievement progress to be persisted so that the app remembers what achievements I have unlocked or am close to unlocking.**
   - **Feature Group:** Data Persistence & Storage
   - **Persona:** user
   - **Priority:** high
   - **Related Question:** What types of data need to be persisted, beyond just user and task information?
   - **Answer:** Persist user-defined custom labels for task categorization and achievement progress to track completion status.
   - **Question Status:** answered
   - **Acceptance Criteria:** Not defined

7. **As a developer, I want to organize user data in Supabase with separate collections for users and tasks so that I can easily manage and query user-related data.**
   - **Feature Group:** Data Persistence & Storage
   - **Persona:** developer
   - **Priority:** high
   - **Related Question:** How will the data be organized within the storage to ensure quick and efficient data retrieval for the user?
   - **Answer:** Organize user data using Supabase, with separate collections for users and tasks, indexing fields like user ID, task status, and due date for efficient queries.
   - **Question Status:** answered
   - **Acceptance Criteria:** Not defined

8. **As a developer, I want to index fields like user ID, task status, and due date in Supabase so that I can ensure efficient data retrieval for users.**
   - **Feature Group:** Data Persistence & Storage
   - **Persona:** developer
   - **Priority:** high
   - **Related Question:** How will the data be organized within the storage to ensure quick and efficient data retrieval for the user?
   - **Answer:** Organize user data using Supabase, with separate collections for users and tasks, indexing fields like user ID, task status, and due date for efficient queries.
   - **Question Status:** answered
   - **Acceptance Criteria:** Not defined

9. **As a developer, I want to implement data encryption at rest and in transit for user data so that I can protect sensitive information from unauthorized access.**
   - **Feature Group:** Data Persistence & Storage
   - **Persona:** developer
   - **Priority:** high
   - **Related Question:** Are there any specific data compliance requirements we should consider for storing user data?
   - **Answer:** Implement data encryption at rest and in transit, adhere to GDPR principles, and obtain user consent for data collection.
   - **Question Status:** answered
   - **Acceptance Criteria:** Not defined

10. **As a developer, I want to adhere to GDPR principles in data storage and handling so that the application complies with data privacy regulations.**
   - **Feature Group:** Data Persistence & Storage
   - **Persona:** developer
   - **Priority:** high
   - **Related Question:** Are there any specific data compliance requirements we should consider for storing user data?
   - **Answer:** Implement data encryption at rest and in transit, adhere to GDPR principles, and obtain user consent for data collection.
   - **Question Status:** answered
   - **Acceptance Criteria:** Not defined

11. **As a user, I want to be prompted for consent before my data is collected so that I have control over my personal information and how it's used.**
   - **Feature Group:** Data Persistence & Storage
   - **Persona:** user
   - **Priority:** high
   - **Related Question:** Are there any specific data compliance requirements we should consider for storing user data?
   - **Answer:** Implement data encryption at rest and in transit, adhere to GDPR principles, and obtain user consent for data collection.
   - **Question Status:** answered
   - **Acceptance Criteria:** Not defined

12. **As a user, I want my tasks to be stored remotely in a cloud-based database on Supabase so that I can access my tasks from any device.**
   - **Feature Group:** Data Persistence & Storage
   - **Persona:** user
   - **Priority:** high
   - **Related Question:** Will tasks be stored locally on the device, or only remotely?
   - **Answer:** Store tasks remotely using a cloud-based database on Supabase.
   - **Question Status:** answered
   - **Acceptance Criteria:** Not defined


## Gamification & Progression

### High Priority

1. **As a user, I want to earn 10 XP for completing a small task so that I can progress in the game.**
   - **Feature Group:** Gamification & Progression
   - **Persona:** user
   - **Priority:** high
   - **Related Question:** How should experience points (XP) be awarded for different types of tasks?
   - **Answer:** Assign XP values based on task difficulty: small = 10 XP, medium = 25 XP, large = 50 XP, and urgent = 75 XP.
   - **Question Status:** answered
   - **Acceptance Criteria:** Not defined

2. **As a user, I want to earn 25 XP for completing a medium task so that I can progress in the game.**
   - **Feature Group:** Gamification & Progression
   - **Persona:** user
   - **Priority:** high
   - **Related Question:** How should experience points (XP) be awarded for different types of tasks?
   - **Answer:** Assign XP values based on task difficulty: small = 10 XP, medium = 25 XP, large = 50 XP, and urgent = 75 XP.
   - **Question Status:** answered
   - **Acceptance Criteria:** Not defined

3. **As a user, I want to earn 50 XP for completing a large task so that I can progress in the game.**
   - **Feature Group:** Gamification & Progression
   - **Persona:** user
   - **Priority:** high
   - **Related Question:** How should experience points (XP) be awarded for different types of tasks?
   - **Answer:** Assign XP values based on task difficulty: small = 10 XP, medium = 25 XP, large = 50 XP, and urgent = 75 XP.
   - **Question Status:** answered
   - **Acceptance Criteria:** Not defined

4. **As a user, I want to earn 75 XP for completing an urgent task so that I can progress in the game.**
   - **Feature Group:** Gamification & Progression
   - **Persona:** user
   - **Priority:** high
   - **Related Question:** How should experience points (XP) be awarded for different types of tasks?
   - **Answer:** Assign XP values based on task difficulty: small = 10 XP, medium = 25 XP, large = 50 XP, and urgent = 75 XP.
   - **Question Status:** answered
   - **Acceptance Criteria:** Not defined

5. **As a user, I want to start at Level 1 with 0 XP so that I can begin my progression in the game.**
   - **Feature Group:** Gamification & Progression
   - **Persona:** user
   - **Priority:** high
   - **Related Question:** What is the range of experience points (XP) a user can accumulate, and how does that translate into levels?
   - **Answer:** Define level progression based on cumulative XP, starting at Level 1 with 0 XP and incrementing levels based on reaching XP thresholds.
   - **Question Status:** answered
   - **Acceptance Criteria:** Not defined

6. **As a user, I want to increment my level based on reaching defined XP thresholds so that I can achieve higher levels as I complete tasks.**
   - **Feature Group:** Gamification & Progression
   - **Persona:** user
   - **Priority:** high
   - **Related Question:** What is the range of experience points (XP) a user can accumulate, and how does that translate into levels?
   - **Answer:** Define level progression based on cumulative XP, starting at Level 1 with 0 XP and incrementing levels based on reaching XP thresholds.
   - **Question Status:** answered
   - **Acceptance Criteria:** Not defined

7. **As a user, I want to receive 10 XP for completing a task without a defined difficulty so that I still gain experience from it.**
   - **Feature Group:** Gamification & Progression
   - **Persona:** user
   - **Priority:** high
   - **Related Question:** How will the application handle awarding XP for tasks with no defined difficulty?
   - **Answer:** Set the default XP value to 10 for tasks created without a defined difficulty.
   - **Question Status:** answered
   - **Acceptance Criteria:** Not defined

8. **As a user, I want to have a maximum attainable level of 100 so that there's an end goal to my progression.**
   - **Feature Group:** Gamification & Progression
   - **Persona:** user
   - **Priority:** high
   - **Related Question:** Will there be a maximum level that a user can attain?
   - **Answer:** Set a maximum attainable level of 100 for users.
   - **Question Status:** answered
   - **Acceptance Criteria:** Not defined


## Rewards & Achievements

### High Priority

1. **As a user, I want to earn an achievement for completing 10 tasks so that I am recognized for my initial progress.**
   - **Feature Group:** Rewards & Achievements
   - **Persona:** user
   - **Priority:** high
   - **Related Question:** What kind of achievements will be available for users to earn?
   - **Answer:** Implement achievements for completing 10, 25, 50, 100 tasks, reaching levels 5, 10, 15, 20, and completing all urgent tasks in a week.
   - **Question Status:** answered
   - **Acceptance Criteria:** Not defined

2. **As a user, I want to earn an achievement for completing 25 tasks so that I am recognized for my continued progress.**
   - **Feature Group:** Rewards & Achievements
   - **Persona:** user
   - **Priority:** high
   - **Related Question:** What kind of achievements will be available for users to earn?
   - **Answer:** Implement achievements for completing 10, 25, 50, 100 tasks, reaching levels 5, 10, 15, 20, and completing all urgent tasks in a week.
   - **Question Status:** answered
   - **Acceptance Criteria:** Not defined

3. **As a user, I want to earn an achievement for completing 50 tasks so that I am recognized for my increased productivity.**
   - **Feature Group:** Rewards & Achievements
   - **Persona:** user
   - **Priority:** high
   - **Related Question:** What kind of achievements will be available for users to earn?
   - **Answer:** Implement achievements for completing 10, 25, 50, 100 tasks, reaching levels 5, 10, 15, 20, and completing all urgent tasks in a week.
   - **Question Status:** answered
   - **Acceptance Criteria:** Not defined

4. **As a user, I want to earn an achievement for completing 100 tasks so that I am recognized for my high productivity.**
   - **Feature Group:** Rewards & Achievements
   - **Persona:** user
   - **Priority:** high
   - **Related Question:** What kind of achievements will be available for users to earn?
   - **Answer:** Implement achievements for completing 10, 25, 50, 100 tasks, reaching levels 5, 10, 15, 20, and completing all urgent tasks in a week.
   - **Question Status:** answered
   - **Acceptance Criteria:** Not defined

5. **As a user, I want to earn an achievement for reaching level 5 so that I am recognized for leveling up.**
   - **Feature Group:** Rewards & Achievements
   - **Persona:** user
   - **Priority:** high
   - **Related Question:** What kind of achievements will be available for users to earn?
   - **Answer:** Implement achievements for completing 10, 25, 50, 100 tasks, reaching levels 5, 10, 15, 20, and completing all urgent tasks in a week.
   - **Question Status:** answered
   - **Acceptance Criteria:** Not defined

6. **As a user, I want to earn an achievement for reaching level 10 so that I am recognized for leveling up.**
   - **Feature Group:** Rewards & Achievements
   - **Persona:** user
   - **Priority:** high
   - **Related Question:** What kind of achievements will be available for users to earn?
   - **Answer:** Implement achievements for completing 10, 25, 50, 100 tasks, reaching levels 5, 10, 15, 20, and completing all urgent tasks in a week.
   - **Question Status:** answered
   - **Acceptance Criteria:** Not defined

7. **As a user, I want to earn an achievement for reaching level 15 so that I am recognized for leveling up.**
   - **Feature Group:** Rewards & Achievements
   - **Persona:** user
   - **Priority:** high
   - **Related Question:** What kind of achievements will be available for users to earn?
   - **Answer:** Implement achievements for completing 10, 25, 50, 100 tasks, reaching levels 5, 10, 15, 20, and completing all urgent tasks in a week.
   - **Question Status:** answered
   - **Acceptance Criteria:** Not defined

8. **As a user, I want to earn an achievement for reaching level 20 so that I am recognized for leveling up.**
   - **Feature Group:** Rewards & Achievements
   - **Persona:** user
   - **Priority:** high
   - **Related Question:** What kind of achievements will be available for users to earn?
   - **Answer:** Implement achievements for completing 10, 25, 50, 100 tasks, reaching levels 5, 10, 15, 20, and completing all urgent tasks in a week.
   - **Question Status:** answered
   - **Acceptance Criteria:** Not defined

9. **As a user, I want to earn an achievement for completing all urgent tasks in a week so that I am recognized for my efficiency.**
   - **Feature Group:** Rewards & Achievements
   - **Persona:** user
   - **Priority:** high
   - **Related Question:** What kind of achievements will be available for users to earn?
   - **Answer:** Implement achievements for completing 10, 25, 50, 100 tasks, reaching levels 5, 10, 15, 20, and completing all urgent tasks in a week.
   - **Question Status:** answered
   - **Acceptance Criteria:** Not defined

10. **As a user, I want to receive XP for registering an account so that I can begin my RPG Todo journey with a boost.**
   - **Feature Group:** Rewards & Achievements
   - **Persona:** user
   - **Priority:** high
   - **Related Question:** Besides completing tasks and leveling up, what other actions might trigger achievements?
   - **Answer:** Implement some XP for registering an account and logging in daily
   - **Question Status:** answered
   - **Acceptance Criteria:** Not defined

11. **As a user, I want to receive XP for logging in daily so that I am rewarded for consistent use of the app.**
   - **Feature Group:** Rewards & Achievements
   - **Persona:** user
   - **Priority:** high
   - **Related Question:** Besides completing tasks and leveling up, what other actions might trigger achievements?
   - **Answer:** Implement some XP for registering an account and logging in daily
   - **Question Status:** answered
   - **Acceptance Criteria:** Not defined

12. **As a user, I want to receive a notification when I unlock an achievement so that I am immediately aware of my progress and rewards.**
   - **Feature Group:** Rewards & Achievements
   - **Persona:** user
   - **Priority:** high
   - **Related Question:** Will the user receive a notification when they unlock an achievement?
   - **Answer:** Yes
   - **Question Status:** answered
   - **Acceptance Criteria:** Not defined


## Task Management

### High Priority

1. **As a user, I want to create a task with a title, description, due date, and difficulty/priority so that I can track and manage my to-dos effectively.**
   - **Feature Group:** Task Management
   - **Persona:** user
   - **Priority:** high
   - **Related Question:** What are the key steps involved in creating a new task?
   - **Answer:** Implement a "Create Task" feature that captures task title, description, due date, difficulty/priority, assigns corresponding XP, and saves the task to the user's task list.
   - **Question Status:** answered
   - **Acceptance Criteria:** Not defined

2. **As a user, I want the system to assign an XP value to a task based on its difficulty/priority so that I can earn experience points for completing tasks.**
   - **Feature Group:** Task Management
   - **Persona:** user
   - **Priority:** high
   - **Related Question:** What are the key steps involved in creating a new task?
   - **Answer:** Implement a "Create Task" feature that captures task title, description, due date, difficulty/priority, assigns corresponding XP, and saves the task to the user's task list.
   - **Question Status:** answered
   - **Acceptance Criteria:** Not defined

3. **As a user, I want the task to be saved to my task list after creation so that I can view and manage all my tasks in one place.**
   - **Feature Group:** Task Management
   - **Persona:** user
   - **Priority:** high
   - **Related Question:** What are the key steps involved in creating a new task?
   - **Answer:** Implement a "Create Task" feature that captures task title, description, due date, difficulty/priority, assigns corresponding XP, and saves the task to the user's task list.
   - **Question Status:** answered
   - **Acceptance Criteria:** Not defined

4. **As a user, I want to categorize tasks using custom labels for project names or client names so that I can easily organize and filter my tasks.**
   - **Feature Group:** Task Management
   - **Persona:** user
   - **Priority:** high
   - **Related Question:** Are there any specific categories or tags we want users to be able to apply to tasks?
   - **Answer:** Implement task categorisation using custom labels for project name or client name
   - **Question Status:** answered
   - **Acceptance Criteria:** Not defined

5. **As a user, I want to select a priority level for a task from options like Low, Medium, High, and Urgent so that I can indicate the task's importance.**
   - **Feature Group:** Task Management
   - **Persona:** user
   - **Priority:** high
   - **Related Question:** Will tasks have different levels of priority? If so, how will these be indicated?
   - **Answer:** Implement a priority field for tasks with options: Low, Medium, High, Urgent, and visually indicate priority through colour-coding.
   - **Question Status:** answered
   - **Acceptance Criteria:** Not defined

6. **As a user, I want task priorities to be visually indicated using color-coding so that I can quickly identify the most important tasks.**
   - **Feature Group:** Task Management
   - **Persona:** user
   - **Priority:** high
   - **Related Question:** Will tasks have different levels of priority? If so, how will these be indicated?
   - **Answer:** Implement a priority field for tasks with options: Low, Medium, High, Urgent, and visually indicate priority through colour-coding.
   - **Question Status:** answered
   - **Acceptance Criteria:** Not defined

7. **As a user, I want to mark tasks as complete so that I can track my progress and gain XP.**
   - **Feature Group:** Task Management
   - **Persona:** user
   - **Priority:** high
   - **Related Question:** Can you describe the intended workflow for creating and managing tasks on a daily basis?
   - **Answer:** Implement a daily task management workflow where users create tasks with titles, descriptions, due dates, difficulty, and categories, then mark tasks as complete to gain XP and achievement progress.
   - **Question Status:** answered
   - **Acceptance Criteria:** Not defined

8. **As a user, I want to gain achievement progress by marking tasks complete so that I am motivated to complete more tasks.**
   - **Feature Group:** Task Management
   - **Persona:** user
   - **Priority:** high
   - **Related Question:** Can you describe the intended workflow for creating and managing tasks on a daily basis?
   - **Answer:** Implement a daily task management workflow where users create tasks with titles, descriptions, due dates, difficulty, and categories, then mark tasks as complete to gain XP and achievement progress.
   - **Question Status:** answered
   - **Acceptance Criteria:** Not defined

9. **As a user, I want to archive completed tasks so that my main task list remains uncluttered.**
   - **Feature Group:** Task Management
   - **Persona:** user
   - **Priority:** high
   - **Related Question:** Will completed tasks be archived or remain visible in the task list?
   - **Answer:** Implement an archive feature to move tasks from the main task list to an archive section.
   - **Question Status:** answered
   - **Acceptance Criteria:** Not defined

10. **As a user, I want to view my archived tasks in a separate archive section so that I can refer back to them if needed.**
   - **Feature Group:** Task Management
   - **Persona:** user
   - **Priority:** high
   - **Related Question:** Will completed tasks be archived or remain visible in the task list?
   - **Answer:** Implement an archive feature to move tasks from the main task list to an archive section.
   - **Question Status:** answered
   - **Acceptance Criteria:** Not defined


## User Account & Profile

### High Priority

1. **As a new user, I want to register with a username, email, and password so that I can create an account and start using the RPG Todo app.**
   - **Feature Group:** User Account & Profile
   - **Persona:** user
   - **Priority:** high
   - **Related Question:** What information will be required during user registration?
   - **Answer:** During registration, collect username, email, and password, storing them securely in the user's profile information.
   - **Question Status:** answered
   - **Acceptance Criteria:** Not defined

2. **As a user, I want to be able to create an account with a username and password so that I can track my progress and achievements.**
   - **Feature Group:** User Account & Profile
   - **Persona:** user
   - **Priority:** high
   - **Related Question:** What information, beyond the basics, do users need to manage within their profile settings?
   - **Answer:** Not provided
   - **Question Status:** not_relevant
   - **Acceptance Criteria:** Not defined

3. **As a developer, I want to securely store user registration information, including username, email, and password, so that user accounts are protected.**
   - **Feature Group:** User Account & Profile
   - **Persona:** developer
   - **Priority:** high
   - **Related Question:** What information will be required during user registration?
   - **Answer:** During registration, collect username, email, and password, storing them securely in the user's profile information.
   - **Question Status:** answered
   - **Acceptance Criteria:** Not defined

4. **As a user, I want to be able to log in to my account using my username and password so that I can access my tasks and profile.**
   - **Feature Group:** User Account & Profile
   - **Persona:** user
   - **Priority:** high
   - **Related Question:** What information, beyond the basics, do users need to manage within their profile settings?
   - **Answer:** Not provided
   - **Question Status:** not_relevant
   - **Acceptance Criteria:** Not defined

5. **As a user, I want my profile to store my email address, registration date, experience points, level, achievements, and completed task count, so that I can track my progress and stats within the app.**
   - **Feature Group:** User Account & Profile
   - **Persona:** user
   - **Priority:** high
   - **Related Question:** Besides the basic information like username and password, what other user details need to be stored in user profiles?
   - **Answer:** Store the user's email address, registration date, experience points, level, achievements, and completed task count in their profile.
   - **Question Status:** answered
   - **Acceptance Criteria:** Not defined

6. **As a user, I want to be able to edit my username in my profile so that I can keep my profile information up to date.**
   - **Feature Group:** User Account & Profile
   - **Persona:** user
   - **Priority:** high
   - **Related Question:** Will users be able to change their username or email address after registration?
   - **Answer:** Implement "Edit Profile" functionality allowing users to update their username.
   - **Question Status:** answered
   - **Acceptance Criteria:** Not defined


## User Interface & Experience

### High Priority

1. **As a user, I want to access a Task List section so that I can view and manage my existing tasks.**
   - **Feature Group:** User Interface & Experience
   - **Persona:** user
   - **Priority:** high
   - **Related Question:** What are the core screens or sections of the app's user interface?
   - **Answer:** Develop the UI with the following core sections: Task List, Task Creation, Profile, and Achievements and potentially a leaderboard if we have enough time.
   - **Question Status:** answered
   - **Acceptance Criteria:** Not defined

2. **As a user, I want to access a Task Creation section so that I can add new tasks to my list.**
   - **Feature Group:** User Interface & Experience
   - **Persona:** user
   - **Priority:** high
   - **Related Question:** What are the core screens or sections of the app's user interface?
   - **Answer:** Develop the UI with the following core sections: Task List, Task Creation, Profile, and Achievements and potentially a leaderboard if we have enough time.
   - **Question Status:** answered
   - **Acceptance Criteria:** Not defined

3. **As a user, I want to access a Profile section so that I can view my RPG statistics and achievements.**
   - **Feature Group:** User Interface & Experience
   - **Persona:** user
   - **Priority:** high
   - **Related Question:** What are the core screens or sections of the app's user interface?
   - **Answer:** Develop the UI with the following core sections: Task List, Task Creation, Profile, and Achievements and potentially a leaderboard if we have enough time.
   - **Question Status:** answered
   - **Acceptance Criteria:** Not defined

4. **As a user, I want to access an Achievements section so that I can see all available and unlocked achievements.**
   - **Feature Group:** User Interface & Experience
   - **Persona:** user
   - **Priority:** high
   - **Related Question:** What are the core screens or sections of the app's user interface?
   - **Answer:** Develop the UI with the following core sections: Task List, Task Creation, Profile, and Achievements and potentially a leaderboard if we have enough time.
   - **Question Status:** answered
   - **Acceptance Criteria:** Not defined

5. **As a user, I want to view my current level in the header so that I can easily track my RPG progress.**
   - **Feature Group:** User Interface & Experience
   - **Persona:** user
   - **Priority:** high
   - **Related Question:** How prominently should the RPG elements be displayed within the user interface?
   - **Answer:** Display the user's level and experience points in the header, and achievement progress in a dedicated "Profile" or "Achievements" section.
   - **Question Status:** answered
   - **Acceptance Criteria:** Not defined

6. **As a user, I want to view my current experience points in the header so that I can easily track my RPG progress.**
   - **Feature Group:** User Interface & Experience
   - **Persona:** user
   - **Priority:** high
   - **Related Question:** How prominently should the RPG elements be displayed within the user interface?
   - **Answer:** Display the user's level and experience points in the header, and achievement progress in a dedicated "Profile" or "Achievements" section.
   - **Question Status:** answered
   - **Acceptance Criteria:** Not defined

7. **As a user, I want to view a progress bar in the header that visually represents my experience points towards the next level so that I can easily see how close I am to leveling up.**
   - **Feature Group:** User Interface & Experience
   - **Persona:** user
   - **Priority:** high
   - **Related Question:** Besides displaying level and experience points, are there any other elements planned for the header?
   - **Answer:** Include a progress bar visually representing the user's experience points towards the next level in the header.
   - **Question Status:** answered
   - **Acceptance Criteria:** Not defined

8. **As a user, I want to click on a link to the terms of service so that I can read the terms of service in a new browser tab.**
   - **Feature Group:** User Interface & Experience
   - **Persona:** user
   - **Priority:** high
   - **Related Question:** Will the terms of service and privacy policy open in a new browser tab or within the app?
   - **Answer:** Implement links to the terms of service and privacy policy to open in a new browser tab.
   - **Question Status:** answered
   - **Acceptance Criteria:** Not defined

9. **As a user, I want to click on a link to the privacy policy so that I can read the privacy policy in a new browser tab.**
   - **Feature Group:** User Interface & Experience
   - **Persona:** user
   - **Priority:** high
   - **Related Question:** Will the terms of service and privacy policy open in a new browser tab or within the app?
   - **Answer:** Implement links to the terms of service and privacy policy to open in a new browser tab.
   - **Question Status:** answered
   - **Acceptance Criteria:** Not defined


### Medium Priority

1. **As a user, I want to see a leaderboard (if available) so that I can compare my progress with other users.**
   - **Feature Group:** User Interface & Experience
   - **Persona:** user
   - **Priority:** medium
   - **Related Question:** What are the core screens or sections of the app's user interface?
   - **Answer:** Develop the UI with the following core sections: Task List, Task Creation, Profile, and Achievements and potentially a leaderboard if we have enough time.
   - **Question Status:** answered
   - **Acceptance Criteria:** Not defined


## Uncategorised

### High Priority

1. **As a user, I want to easily access the Terms of Service so that I can understand my rights and responsibilities when using the app.**
   - **Feature Group:** Uncategorised
   - **Persona:** user
   - **Priority:** high
   - **Related Question:** Are there any specific terms of service or privacy policies that need to be displayed within the app?
   - **Answer:** Incorporate a link to the terms of service and privacy policy in the app's settings or account section.
   - **Question Status:** answered
   - **Acceptance Criteria:** Not defined

2. **As a user, I want to easily access the Privacy Policy so that I can understand how my data is being used and protected.**
   - **Feature Group:** Uncategorised
   - **Persona:** user
   - **Priority:** high
   - **Related Question:** Are there any specific terms of service or privacy policies that need to be displayed within the app?
   - **Answer:** Incorporate a link to the terms of service and privacy policy in the app's settings or account section.
   - **Question Status:** answered
   - **Acceptance Criteria:** Not defined

3. **As a developer, I want to implement a link to the Terms of Service within the app's settings or account section so that users can easily access it.**
   - **Feature Group:** Uncategorised
   - **Persona:** developer
   - **Priority:** high
   - **Related Question:** Are there any specific terms of service or privacy policies that need to be displayed within the app?
   - **Answer:** Incorporate a link to the terms of service and privacy policy in the app's settings or account section.
   - **Question Status:** answered
   - **Acceptance Criteria:** Not defined

4. **As a developer, I want to implement a link to the Privacy Policy within the app's settings or account section so that users can easily access it.**
   - **Feature Group:** Uncategorised
   - **Persona:** developer
   - **Priority:** high
   - **Related Question:** Are there any specific terms of service or privacy policies that need to be displayed within the app?
   - **Answer:** Incorporate a link to the terms of service and privacy policy in the app's settings or account section.
   - **Question Status:** answered
   - **Acceptance Criteria:** Not defined


