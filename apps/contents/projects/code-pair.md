---
name: Code Pair
description: Pair to pair coding platform for developers to collaborate on coding problems and interview preparation.
github: https://github.com/elskow/codepair
stacks: [GO, React, Websockets, WebRTC]
date: 2024-09-18
priority: 1
---

CodePair is a comprehensive platform for conducting remote technical interviews with integrated code editing and real-time communication features. It helps technical teams evaluate candidates effectively through live coding sessions with built-in video, chat, and collaborative code editing capabilities.

## Key Features

- **Collaborative Code Editor**: Monaco-based editor with real-time synchronization
- **WebRTC Video Conferencing**: Built-in video and audio communication
- **Chat Interface**: Text communication during interview sessions
- **Notes System**: TipTap-powered rich text editor for interviewers to take notes
- **Room Management**: Create, configure and manage interview sessions
- **User Management**: Different access levels for staff and lead interviewers

## Technology Stack

The platform is built on a modern, microservices architecture:

### Frontend

- React with TypeScript
- TanStack Query for state management
- TailwindCSS for styling
- Monaco Editor for the code editor
- TipTap for rich text editing

### Backend

- Go-based microservices:
  - Core Service (Gin) for business logic
  - Peer Service (Fiber) for WebRTC signaling
- PostgreSQL database with GORM
- JWT authentication
- WebSocket and WebRTC for real-time communication
- Zap for structured logging

## Architecture

CodePair follows a microservices architecture with three main components:

1. **Core Service**: Handles business logic, authentication, and data persistence
2. **Peer Service**: Manages WebRTC connections and real-time communication
3. **Client Application**: Provides the user interface and interaction layer

This architecture allows for:

- Better scalability for different components
- Isolated development and deployment
- Focused testing and maintenance

## Development Approach

The project uses Docker for consistent development and deployment environments, with a structured Makefile system to simplify common development tasks. This approach ensures consistency across different environments and makes it easy for new developers to join the project.

Each service is designed to be independently scalable, with clear separation of concerns between the real-time communication layer and the business logic layer.
