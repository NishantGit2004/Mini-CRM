# Xeno SDE Internship: Mini CRM Platform

Submitted by: **Nishant Chopde**

This project is a fully functional Mini CRM platform built for the Xeno SDE Internship assignment. It enables users to segment customers, launch personalized marketing campaigns, and leverage AI for smarter decision-making.

---

### 🚀 Live Demo & Video

* **Deployed Application:** [https://nishantchopde.me](https://nishantchopde.me)  
* **Demo Video (7 mins):** [Xeno SDE Assessment Demo Video](https://drive.google.com/file/d/10qQAIZKN6zADLn2BM-0rgzd8Nh45RGLC/view?usp=sharing)

---

### ✨ Features

| Feature | Status | Notes |
| :--- | :---: | :--- |
| **Authentication** | ✅ | Google OAuth 2.0 to protect all routes. |
| **Data Ingestion APIs** | ✅ | Secure REST APIs for ingesting Customers and Orders. |
| **Scalable Ingestion** | ✅ | **(Brownie Points)** Implemented a Pub/Sub model with **Redis Streams** for asynchronous, scalable data persistence. |
| **Campaign Creation UI** | ✅ | Dynamic UI to build audience segments with complex AND/OR logic. |
| **Audience Size Preview** | ✅ | Real-time audience size preview before launching a campaign. |
| **Campaign Delivery** | ✅ | Asynchronous campaign delivery to a mock vendor API simulating ~90% success rate. |
| **Delivery Status Tracking** | ✅ | Delivery receipts are processed via a webhook to update campaign logs. |
| **Scalable DB Updates** | ✅ | **(Brownie Points)** Delivery receipts are processed in batches to reduce database load. |
| **Campaign History** | ✅ | View all past campaigns, sorted by most recent, with delivery stats. |
| **AI: NL to Segments** | ✅ | **(AI Feature)** Converts natural language prompts (e.g., "users with >5k spend") into logical rules. |
| **AI: Message Generation** | ✅ | **(AI Feature)** Generates personalized message variants based on the campaign audience. |

---

### 🏗️ Architecture Diagram

Here is a high-level overview of the system architecture:

![System Architecture](https://github.com/NishantGit2004/Mini-CRM/blob/main/frontend/public/System-Architecture.png?raw=true)

**Flow of the system:**
1.  **Frontend (React)** interacts with the Backend API.
2.  **Backend API (Node.js)** handles authentication, validation, and core business logic.
3.  For data ingestion, the API publishes jobs to a **Message Broker (Redis Streams)**.
4.  A separate **Consumer Service** picks up these jobs and writes data to the **Database (MongoDB)**.
5.  Campaign delivery calls a **Mock Vendor API**, which calls back to a **Delivery Receipt API** on our backend.
6.  AI features are powered by making API calls to an **External AI Service (Google Vertex AI)**.

---

### 💻 Tech Stack & Tools

* **Frontend:** React.js
* **Backend:** Node.js (Express.js)
* **Database:** MongoDB
* **Messaging Queue:** Redis Streams for asynchronous processing  
* **AI Integration:** Google Vertex AI for natural language processing and content generation  
* **Authentication:** Google OAuth 2.0  
* **Deployment:** AWS EC2  

---

### 🔧 Local Setup Instructions

Follow these steps to run the project on your local machine:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/NishantGit2004/Mini-CRM.git
    cd Mini-CRM
    ```

2.  **Setup Environment Variables:**
    Create a `.env` file in the `server` (or backend) directory. Use the `.env.example` file as a template for the required variables like database connection strings, Google OAuth credentials, AI API keys, etc.

3.  **Install Dependencies:**
    ```bash
    # For the backend
    cd backend
    npm install

    # For the frontend
    cd ../frontend
    npm install
    ```

4.  **Run the Application:**
    ```bash
    # Run the backend server
    cd backend
    npm start

    # Run the frontend development server
    cd ../frontend
    npm start
    ```

5.  The application should now be running at `http://localhost:3000`.

---

### ⚠️ Known Limitations & Assumptions

* **Mock Vendor API:** The campaign delivery system connects to a mock vendor API that simulates success/failure. A real-world implementation would require robust integration with a real email/SMS provider.  
* **No Drag-and-Drop:** The audience rule builder is based on dropdowns and inputs for functionality. A visual drag-and-drop interface was considered but scoped out to focus on core backend logic.  
* **Simulated Data:** The customer and order data used for the demo is pre-seeded and does not represent real user activity patterns.  

---
