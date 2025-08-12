# GraphQL API Examples

This file contains example queries and mutations for testing your GraphQL API.

## Queries

### 1. Get All Projects

```graphql
query GetProjects {
  projects {
    id
    title
    description
    status
    progress
    team {
      name
      avatar
    }
    dueDate
    daysRemaining
    taskCount
    completedTaskCount
    createdAt
  }
}
```

### 2. Get Project by ID

```graphql
query GetProject($id: ID!) {
  project(id: $id) {
    id
    title
    description
    status
    progress
    team {
      name
      avatar
    }
    dueDate
    daysRemaining
    taskCount
    completedTaskCount
    tasks {
      id
      title
      status
      priority
      assignee {
        name
        avatar
      }
      dueDate
      completionPercentage
    }
    createdAt
    updatedAt
  }
}
```

### 3. Get Projects by Status

```graphql
query GetProjectsByStatus($status: ProjectStatus!) {
  projectByStatus(status: $status) {
    id
    title
    status
    progress
    taskCount
    completedTaskCount
  }
}
```

### 4. Get All Tasks

```graphql
query GetTasks {
  tasks {
    id
    title
    description
    status
    priority
    assignee {
      name
      avatar
    }
    projectId
    project {
      title
      status
    }
    dueDate
    daysRemaining
    estimatedHours
    actualHours
    tags
    completionPercentage
    createdAt
  }
}
```

### 5. Get Tasks by Project

```graphql
query GetTasksByProject($projectId: ID!) {
  tasksByProject(projectId: $projectId) {
    id
    title
    status
    priority
    assignee {
      name
    }
    dueDate
    completionPercentage
  }
}
```

### 6. Get Tasks by Assignee

```graphql
query GetTasksByAssignee($assignee: String!) {
  tasksByAssignee(assignee: $assignee) {
    id
    title
    status
    priority
    projectId
    project {
      title
    }
    dueDate
  }
}
```

### 7. Get Dashboard Statistics

```graphql
query GetDashboardStats {
  dashboardStats {
    totalProjects
    totalTasks
    completedTasks
    activeProjects
    overdueTasks
    projectsByStatus {
      status
      count
    }
    tasksByStatus {
      status
      count
    }
    tasksByPriority {
      priority
      count
    }
  }
}
```

### 8. Get Projects with Pagination and Sorting

```graphql
query GetProjectsPaginated(
  $limit: Int
  $offset: Int
  $sortBy: String
  $sortOrder: String
) {
  projects(
    limit: $limit
    offset: $offset
    sortBy: $sortBy
    sortOrder: $sortOrder
  ) {
    id
    title
    status
    progress
    createdAt
  }
}
```

## Mutations

### 1. Create Project

```graphql
mutation CreateProject($input: ProjectInput!) {
  createProject(input: $input) {
    id
    title
    description
    status
    progress
    team {
      name
      avatar
    }
    dueDate
    createdAt
  }
}
```

**Variables:**

```json
{
  "input": {
    "title": "New Project",
    "description": "This is a new project description",
    "status": "planning",
    "team": [
      {
        "name": "John Doe",
        "avatar": "https://example.com/avatar1.jpg"
      },
      {
        "name": "Jane Smith",
        "avatar": "https://example.com/avatar2.jpg"
      }
    ],
    "dueDate": "2024-12-31T23:59:59.000Z"
  }
}
```

### 2. Update Project

```graphql
mutation UpdateProject($id: ID!, $input: ProjectUpdateInput!) {
  updateProject(id: $id, input: $input) {
    id
    title
    description
    status
    progress
    updatedAt
  }
}
```

**Variables:**

```json
{
  "id": "project_id_here",
  "input": {
    "status": "active",
    "progress": 25
  }
}
```

### 3. Delete Project

```graphql
mutation DeleteProject($id: ID!) {
  deleteProject(id: $id)
}
```

### 4. Create Task

```graphql
mutation CreateTask($input: TaskInput!) {
  createTask(input: $input) {
    id
    title
    description
    status
    priority
    assignee {
      name
      avatar
    }
    projectId
    dueDate
    estimatedHours
    tags
    createdAt
  }
}
```

**Variables:**

```json
{
  "input": {
    "title": "Implement User Authentication",
    "description": "Add JWT-based authentication to the application",
    "status": "todo",
    "priority": "high",
    "assignee": {
      "name": "John Doe",
      "avatar": "https://example.com/avatar1.jpg"
    },
    "projectId": "project_id_here",
    "dueDate": "2024-11-30T23:59:59.000Z",
    "estimatedHours": 8,
    "tags": ["authentication", "security", "backend"]
  }
}
```

### 5. Update Task

```graphql
mutation UpdateTask($id: ID!, $input: TaskUpdateInput!) {
  updateTask(id: $id, input: $input) {
    id
    title
    status
    priority
    actualHours
    updatedAt
  }
}
```

**Variables:**

```json
{
  "id": "task_id_here",
  "input": {
    "status": "in_progress",
    "actualHours": 4
  }
}
```

### 6. Delete Task

```graphql
mutation DeleteTask($id: ID!) {
  deleteTask(id: $id)
}
```

### 7. Bulk Update Task Status

```graphql
mutation BulkUpdateTaskStatus($taskIds: [ID!]!, $status: TaskStatus!) {
  bulkUpdateTaskStatus(taskIds: $taskIds, status: $status) {
    id
    title
    status
    updatedAt
  }
}
```

**Variables:**

```json
{
  "taskIds": ["task_id_1", "task_id_2", "task_id_3"],
  "status": "done"
}
```

## Complex Queries

### 1. Get Project with All Related Data

```graphql
query GetProjectWithDetails($id: ID!) {
  project(id: $id) {
    id
    title
    description
    status
    progress
    team {
      name
      avatar
    }
    dueDate
    daysRemaining
    taskCount
    completedTaskCount
    tasks {
      id
      title
      description
      status
      priority
      assignee {
        name
        avatar
      }
      dueDate
      daysRemaining
      estimatedHours
      actualHours
      tags
      completionPercentage
      createdAt
    }
    createdAt
    updatedAt
  }
}
```

### 2. Search and Filter Tasks

```graphql
query SearchTasks(
  $projectId: ID
  $status: TaskStatus
  $priority: Priority
  $assignee: String
) {
  tasks(
    projectId: $projectId
    status: $status
    priority: $priority
    assignee: $assignee
  ) {
    id
    title
    status
    priority
    assignee {
      name
      avatar
    }
    projectId
    project {
      title
      status
    }
    dueDate
    daysRemaining
    completionPercentage
  }
}
```

## Testing in Apollo Studio

1. Start your server
2. Navigate to `http://localhost:3001/graphql`
3. Use the Apollo Studio interface to test queries and mutations
4. Copy and paste the examples above into the query editor
5. Use the "Variables" panel to input your variables

## Error Handling

The API includes comprehensive error handling:

- Validation errors for invalid input
- Not found errors for missing resources
- Database connection errors
- Custom business logic errors

All errors are formatted consistently and include helpful error codes and messages.
