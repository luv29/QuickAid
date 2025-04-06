# QwikAid – AI-Driven Roadside Assistance & Emergency Support Platform

![banner](https://img.shields.io/badge/MindBend_Hackathon_2025-Odoo_Track-blueviolet)  
Picture a comprehensive roadside assistance system that jumps into action when you break down on a remote national highway as dusk falls and your phone signal fades. It consists of an intelligent, agentic AI that evaluates your situation and arranges for assistance, along with live tracking to determine your location, an SOS button for immediate rescue, and offline capabilities to keep you covered even in signal-dead zones, ensuring that every commuter feels safe and supported no matter how far they roam.

---

## Project Overview
**QwikAid** is a modern, AI-enhanced platform designed to provide instant roadside help in emergency situations. In the event of a medical emergency or a car breakdown, QwikAid links users with local service providers, guarantees real-time updates, and offers offline and multilingual access for broad utility.

---

## Key Features

| Feature                  | Description                                                                 |
|--------------------------|-----------------------------------------------------------------------------|
| Agentic AI Support       | AI-powered assistant for navigating emergencies and coordinating help.       |
| Live Map Tracking        | Real-time tracking of both users and responders on interactive maps.         |
| SOS Mode                 | Three-shake emergency broadcasting with live location and condition broadcasting.     |
| Offline Support          | Works seamlessly in areas with poor or no network coverage.                 |
| Nearby Assistance        | Auto-connects to verified nearby service centers/mechanics.                |
| Multilingual Support     | Available in multiple Indian languages for maximum accessibility.          |
| Payment Gateway          | Integrated payment support for seamless transactions.                      |
| User Reviews             | Rate and review services for improved reliability and quality assurance.   |

---

## Tech Stack

| Layer       | Technology Used                                        |
|-------------|--------------------------------------------------------|
| Frontend    | React Native, Tailwind CSS, React Query                |
| AI          | MCP (Model Context Protocol), Groq (AI Inference Engine), Langgraph (Agentic AI Builder)  |
| Backend     | NestJS, Prisma                                         |
| Database    | MongoDB, SQlite                                      |
| Security    | JWT, Secure Auth, Real-time Monitoring |

---

## User Flow

![image](https://github.com/user-attachments/assets/ed766d8c-84e7-4bb3-b93d-c5a9b4386cdc)


## Architecture Overview

### Agentic AI Flow
![image](https://github.com/user-attachments/assets/185387e7-b4d0-459b-b670-aa36b64fa6b3)
* User sends a query to the Backend via API.
* Backend forwards it to the MCP Client, which prompts the LLM.
* LLM processes the prompt, interacts with the MCP Server, and uses tools (e.g., GPS Tracking, SOS Emergency).
* LLM returns a JSON response to the MCP Client.
* Backend delivers the response to the User.

### Real-time assistance matching
![image](https://github.com/user-attachments/assets/588cb926-50ed-418f-9ceb-7e3bde4a9ba5)

* The client app captures the user's location and sends it to the backend via HTTP POST.
* The backend queries a geo-indexed MongoDB to find the nearest garage.
* Garage details are returned in JSON and displayed on a map using React Native Maps.
* Assistance vehicles send live location via WebSocket for real-time tracking.
* The backend relays vehicle location updates to the client app.

### Offline Support Architecture
![image](https://github.com/user-attachments/assets/2f96261e-19a0-4cf4-b624-1d82a605e6b7)

* App uses geo-hashing to encode driver's GPS location for efficient proximity searches.
* Ride start triggers continuous location tracking and geo-hash storage in local DB.
* Nearby service center data (geo-hash + contact) is cached locally and refreshed online.
* In offline mode, app compares current geo-hash with cached data to find nearby centers.

## Getting Started
Follow these steps to set up and run the app locally.

## Prerequisites
Before you start, make sure you have the following installed:
- [Node.js](https://nodejs.org/) (LTS version recommended)
- [Python](https://www.python.org/downloads/) (3.12 or later)

### 1. Clone the Repository
```sh
git clone https://github.com/jayesh9747/QuickAid.git
cd QwikAid
```

### 2. Set Up Environment Variables
Create a `.env` file in the root of the project and add the necessary environment variables:

```sh
touch .env
```

Edit `.env` and add the environment variables provided in .env.sample file

### 3. Install Dependencies
Navigate to the required directories and install dependencies:

#### Frontend:
```sh
cd user-app-v3
npm install
```

#### Backend:
```sh
cd ../backend
npm install
```

#### AI :
```sh
cd ../AI
pip install -r requirements.txt
```

### 4. Start the FastAPI AI Backend
Navigate to the `AI` directory and run:
```sh
python main.py
```

### 5. Start the Backend Server
Navigate to the backend directory and run:
```sh
npm run start
```

### 6. Start the Frontend Server
Navigate to the frontend directory and run:
```sh
npx expo start
```

## Team Details

Team Name: Drishtikon

Team Members
* Jayesh Sawaliya
* Vaishnavi Mandhane
* Luv Kansal
* Kunj Vipul Goyal




