# Workflow Backend - GraphQL API

This project has been converted from a REST API to a GraphQL API using Apollo Server. The conversion maintains all the original functionality while providing a more flexible and efficient data fetching experience.

## 🚀 What Changed

### Before (REST API)

- Multiple endpoints (`/api/v1/projects`, `/api/v1/tasks`)
- Fixed response structures
- Multiple HTTP requests for related data
- Over-fetching or under-fetching data

### After (GraphQL API)

- Single endpoint (`/graphql`)
- Flexible queries - request only the data you need
- Single request for related data
- Strong typing with GraphQL schema
- Built-in introspection and documentation

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client App    │───▶│  Apollo Server  │───▶│   MongoDB       │
│                 │    │   (GraphQL)     │    │   (Mongoose)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 Project Structure

```
workflow-back/
├── config/
│   └── database.js          # MongoDB connection
├── models/
│   ├── Project.js           # Project Mongoose model
│   └── Task.js              # Task Mongoose model
├── schema/
│   ├── schema.js            # GraphQL type definitions
│   └── resolvers.js         # GraphQL resolvers
├── examples/
│   └── graphql-queries.md   # Example queries and mutations
├── server.js                # Express + Apollo Server setup
├── package.json             # Dependencies
└── README-GRAPHQL.md        # This file
```

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Create a `.env` file:

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/workflow
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### 3. Start the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

### 4. Access GraphQL Playground

Navigate to `http://localhost:3001/graphql` to access Apollo Studio (formerly GraphQL Playground).

## 🔍 GraphQL Schema Overview

### Types

- **Project**: Workflow projects with team, tasks, and progress tracking
- **Task**: Individual tasks within projects
- **TeamMember**: Team members with names and avatars
- **DashboardStats**: Aggregated statistics for dashboard views

### Queries

- `projects`: Get all projects with filtering and pagination
- `project(id)`: Get a specific project by ID
- `tasks`: Get all tasks with filtering and pagination
- `task(id)`: Get a specific task by ID
- `dashboardStats`: Get aggregated statistics

### Mutations

- `createProject`: Create a new project
- `updateProject`: Update an existing project
- `deleteProject`: Delete a project (and its tasks)
- `createTask`: Create a new task
- `updateTask`: Update an existing task
- `deleteTask`: Delete a task
- `bulkUpdateTaskStatus`: Update multiple tasks at once

## 💡 Key Features

### 1. **Flexible Data Fetching**

```graphql
# Get just project titles
query {
  projects {
    title
  }
}

# Get projects with all details
query {
  projects {
    title
    description
    status
    progress
    team {
      name
      avatar
    }
    tasks {
      title
      status
      priority
    }
  }
}
```

### 2. **Efficient Relationships**

```graphql
# Single request for project and all its tasks
query {
  project(id: "project_id") {
    title
    tasks {
      title
      status
      assignee {
        name
      }
    }
  }
}
```

### 3. **Advanced Filtering**

```graphql
query {
  tasks(
    projectId: "project_id"
    status: DONE
    priority: HIGH
    assignee: "John"
  ) {
    title
    status
    priority
  }
}
```

### 4. **Real-time Progress Updates**

- Project progress automatically calculated from task completion
- Task status changes trigger project progress updates
- Virtual fields for computed values (days remaining, completion percentage)

## 🧪 Testing the API

### Using Apollo Studio

1. Open `http://localhost:3001/graphql`
2. Use the built-in query editor
3. Test queries and mutations interactively
4. View schema documentation and types

### Example Queries

See `examples/graphql-queries.md` for comprehensive examples.

### Health Check

```bash
curl http://localhost:3001/health
```

## 🔧 Development

### Adding New Fields

1. Update the schema in `schema/schema.js`
2. Add resolvers in `schema/resolvers.js`
3. Update models if needed

### Adding New Types

1. Define the type in the schema
2. Create input types for mutations
3. Implement resolvers
4. Add to queries/mutations as needed

### Error Handling

- All resolvers include try-catch blocks
- Consistent error formatting
- GraphQL error codes for different error types

## 📊 Performance Considerations

### 1. **N+1 Query Prevention**

- Use `populate()` for related data
- Implement DataLoader for batch loading (future enhancement)

### 2. **Pagination**

- Built-in `limit` and `offset` parameters
- Consider cursor-based pagination for large datasets

### 3. **Caching**

- Apollo Server includes query result caching
- Consider Redis for distributed caching (future enhancement)

## 🚀 Production Deployment

### Environment Variables

```env
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb://production-db:27017/workflow
CORS_ORIGIN=https://yourdomain.com
```

### Security Considerations

- Enable CORS restrictions
- Implement authentication/authorization
- Rate limiting
- Input validation

## 🔮 Future Enhancements

- [ ] Authentication with JWT
- [ ] Real-time subscriptions with GraphQL subscriptions
- [ ] File uploads
- [ ] Advanced search and filtering
- [ ] DataLoader for N+1 query optimization
- [ ] Redis caching layer
- [ ] GraphQL federation for microservices

## 📚 Resources

- [Apollo Server Documentation](https://www.apollographql.com/docs/apollo-server/)
- [GraphQL Specification](https://graphql.org/learn/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [Express.js Documentation](https://expressjs.com/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

---

**Note**: This conversion maintains backward compatibility with your existing data models while providing a modern GraphQL interface. All your existing MongoDB data will work seamlessly with the new GraphQL API.
