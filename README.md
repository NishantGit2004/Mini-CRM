# Xeno SDE Internship: Mini CRM Platform

Submitted by: **Nishant Chopde**

This project is a fully functional Mini CRM platform built for the Xeno SDE Internship assignment. It enables users to segment customers, launch personalized marketing campaigns, and leverage AI for smarter decision-making.

---

### 🚀 Live Demo & Video

* [cite_start]**Deployed Application:** **(https://nishantchopde.me/)]** [cite: 82]
* [cite_start]**Demo Video (7 mins):** **[Link to your demo video on YouTube/Loom]** [cite: 83]

---

### ✨ Features

| Feature | Status | Notes |
| :--- | :---: | :--- |
| **Authentication** | ✅ | [cite_start]Google OAuth 2.0 to protect all routes. |
| **Data Ingestion APIs** | ✅ | [cite_start]Secure REST APIs for ingesting Customers and Orders[cite: 11]. |
| **Scalable Ingestion** | ✅ | [cite_start]**(Brownie Points)** Implemented a Pub/Sub model with **Redis Streams** for asynchronous, scalable data persistence[cite: 13, 15]. |
| **Campaign Creation UI** | ✅ | [cite_start]Dynamic UI to build audience segments with complex AND/OR logic[cite: 18, 20]. |
| **Audience Size Preview**| ✅ | [cite_start]Real-time audience size preview before launching a campaign. |
| **Campaign Delivery**| ✅ | [cite_start]Asynchronous campaign delivery to a mock vendor API simulating ~90% success rate[cite: 31, 33]. |
| **Delivery Status Tracking**| ✅ | [cite_start]Delivery receipts are processed via a webhook to update campaign logs. |
| **Scalable DB Updates** | ✅ | [cite_start]**(Brownie Points)** Delivery receipts are processed in batches to reduce database load. |
| **Campaign History** | ✅ | [cite_start]View all past campaigns, sorted by most recent, with delivery stats[cite: 23, 24, 25, 26]. |
| **AI: NL to Segments** | ✅ | [cite_start]**(AI Feature)** Converts natural language prompts (e.g., "users with >5k spend") into logical rules[cite: 46]. |
| **AI: Message Generation**| ✅ | [cite_start]**(AI Feature)** Generates personalized message variants based on the campaign audience[cite: 48]. |

---

### 🏗️ Architecture Diagram

[cite_start]Here is a high-level overview of the system architecture[cite: 90].

![Project Screenshot](./fronend/public/System Architecture.png)
``

The flow is as follows:
1.  **Frontend (React/Next.js)** interacts with the Backend API.
2.  **Backend API (Node.js/Spring Boot)** handles authentication, validation, and core business logic.
3.  [cite_start]For data ingestion, the API publishes jobs to a **Message Broker (Redis Streams)**.
4.  [cite_start]A separate **Consumer Service** picks up these jobs and writes data to the **Database (MySQL/MongoDB)**.
5.  [cite_start]Campaign delivery calls a **Mock Vendor API**, which calls back to a **Delivery Receipt API** on our backend[cite: 31, 34].
6.  [cite_start]AI features are powered by making API calls to an **External AI Service (OpenAI/Google Vertex AI)**[cite: 59].

---

### 💻 Tech Stack & Tools

[cite_start]A summary of the technologies and tools used in this project[cite: 91].

* [cite_start]**Frontend:** [React.js / Next.js] [cite: 62]
* [cite_start]**Backend:** [Node.js (Express.js) / Java (Spring Boot)] [cite: 63]
* [cite_start]**Database:** [MongoDB / MySQL] [cite: 64]
* [cite_start]**Messaging Queue:** **Redis Streams** for asynchronous processing[cite: 65].
* [cite_start]**AI Integration:** [OpenAI API / Google Vertex AI] for natural language processing and content generation[cite: 66].
* **Authentication:** Google OAuth 2.0.
* [cite_start]**Deployment:** [Vercel (Frontend), Railway (Backend), Render (Services)][cite: 82].

---

### 🔧 Local Setup Instructions

[cite_start]Follow these steps to run the project on your local machine[cite: 89].

1.  **Clone the repository:**
    ```bash
    git clone [Your GitHub Repo URL]
    cd [repository-name]
    ```

2.  **Setup Environment Variables:**
    Create a `.env` file in the `server` (or backend) directory. Use the `.env.example` file as a template for the required variables like database connection strings, Google OAuth credentials, AI API keys, etc.

3.  **Install Dependencies:**
    ```bash
    # For the backend
    cd server
    npm install

    # For the frontend
    cd ../client
    npm install
    ```

4.  **Run the Application:**
    ```bash
    # Run the backend server
    cd server
    npm start

    # Run the frontend development server
    cd ../client
    npm start
    ```

5.  The application should now be running at `http://localhost:3000`.

---

### 📄 API Documentation

[cite_start]The REST APIs for data ingestion are documented and can be tested via Postman or Swagger UI[cite: 11, 12].

* **[Link to your Postman Collection or Swagger UI page]**

---

### ⚠️ Known Limitations & Assumptions

[cite_start]A list of known limitations and assumptions made during development[cite: 92].

* **Mock Vendor API:** The campaign delivery system connects to a mock vendor API that simulates success/failure. A real-world implementation would require robust integration with a real email/SMS provider.
* **No Drag-and-Drop:** The audience rule builder is based on dropdowns and inputs for functionality. A visual drag-and-drop interface was considered but scoped out to focus on core backend logic.
* **Simulated Data:** The customer and order data used for the demo is pre-seeded and does not represent real user activity patterns.
