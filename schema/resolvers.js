import Project from "../models/Project.js";
import Task from "../models/Task.js";

// Helper functions to convert between GraphQL enum values and database values
const convertProjectStatusToDB = (status) => {
  if (status === "on_hold") return "on-hold";
  return status;
};

const convertProjectStatusFromDB = (status) => {
  if (status === "on-hold") return "on_hold";
  return status;
};

const convertTaskStatusToDB = (status) => {
  if (status === "in_progress") return "in-progress";
  return status;
};

const convertTaskStatusFromDB = (status) => {
  if (status === "in-progress") return "in_progress";
  return status;
};

export const resolvers = {
  Query: {
    // Project queries
    projects: async (
      _,
      {
        status,
        limit = 50,
        offset = 0,
        sortBy = "createdAt",
        sortOrder = "desc",
      }
    ) => {
      try {
        const query = {};
        if (status) query.status = convertProjectStatusToDB(status);

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

        const projects = await Project.find(query)
          .sort(sortOptions)
          .limit(limit)
          .skip(offset)
          .populate("tasks");

        return projects;
      } catch (error) {
        throw new Error(`Error fetching projects: ${error.message}`);
      }
    },

    project: async (_, { id }) => {
      try {
        const project = await Project.findById(id).populate("tasks");
        if (!project) {
          throw new Error("Project not found");
        }
        return project;
      } catch (error) {
        throw new Error(`Error fetching project: ${error.message}`);
      }
    },

    projectByStatus: async (_, { status }) => {
      try {
        const projects = await Project.find({
          status: convertProjectStatusToDB(status),
        }).populate("tasks");
        return projects;
      } catch (error) {
        throw new Error(`Error fetching projects by status: ${error.message}`);
      }
    },

    // Task queries
    tasks: async (
      _,
      {
        projectId,
        status,
        priority,
        assignee,
        limit = 50,
        offset = 0,
        sortBy = "createdAt",
        sortOrder = "desc",
      }
    ) => {
      try {
        const query = {};
        if (projectId) query.projectId = projectId;
        if (status) query.status = convertTaskStatusToDB(status);
        if (priority) query.priority = priority;
        if (assignee)
          query["assignee.name"] = { $regex: assignee, $options: "i" };

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

        const tasks = await Task.find(query)
          .sort(sortOptions)
          .limit(limit)
          .skip(offset);

        return tasks;
      } catch (error) {
        throw new Error(`Error fetching tasks: ${error.message}`);
      }
    },

    task: async (_, { id }) => {
      try {
        const task = await Task.findById(id);
        if (!task) {
          throw new Error("Task not found");
        }
        return task;
      } catch (error) {
        throw new Error(`Error fetching task: ${error.message}`);
      }
    },

    tasksByProject: async (_, { projectId }) => {
      try {
        const tasks = await Task.find({ projectId });
        return tasks;
      } catch (error) {
        throw new Error(`Error fetching tasks by project: ${error.message}`);
      }
    },

    tasksByAssignee: async (_, { assignee }) => {
      try {
        const tasks = await Task.find({
          "assignee.name": { $regex: assignee, $options: "i" },
        });
        return tasks;
      } catch (error) {
        throw new Error(`Error fetching tasks by assignee: ${error.message}`);
      }
    },

    // Dashboard queries
    dashboardStats: async () => {
      try {
        const [
          totalProjects,
          totalTasks,
          completedTasks,
          activeProjects,
          overdueTasks,
          projectsByStatus,
          tasksByStatus,
          tasksByPriority,
        ] = await Promise.all([
          Project.countDocuments(),
          Task.countDocuments(),
          Task.countDocuments({ status: "done" }),
          Project.countDocuments({ status: "active" }),
          Task.countDocuments({
            dueDate: { $lt: new Date() },
            status: { $ne: "done" },
          }),
          Project.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } },
            { $project: { status: "$_id", count: 1, _id: 0 } },
          ]),
          Task.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } },
            { $project: { status: "$_id", count: 1, _id: 0 } },
          ]),
          Task.aggregate([
            { $group: { _id: "$priority", count: { $sum: 1 } } },
            { $project: { priority: "$_id", count: 1, _id: 0 } },
          ]),
        ]);

        return {
          totalProjects,
          totalTasks,
          completedTasks,
          activeProjects,
          overdueTasks,
          projectsByStatus,
          tasksByStatus,
          tasksByPriority,
        };
      } catch (error) {
        throw new Error(`Error fetching dashboard stats: ${error.message}`);
      }
    },
  },

  Mutation: {
    // Project mutations
    createProject: async (_, { input }) => {
      try {
        // Convert status if provided
        if (input.status) {
          input.status = convertProjectStatusToDB(input.status);
        }
        const project = new Project(input);
        await project.save();
        return project;
      } catch (error) {
        throw new Error(`Error creating project: ${error.message}`);
      }
    },

    updateProject: async (_, { id, input }) => {
      try {
        // Convert status if provided
        if (input.status) {
          input.status = convertProjectStatusToDB(input.status);
        }
        const project = await Project.findByIdAndUpdate(
          id,
          { ...input },
          { new: true, runValidators: true }
        );

        if (!project) {
          throw new Error("Project not found");
        }

        return project;
      } catch (error) {
        throw new Error(`Error updating project: ${error.message}`);
      }
    },

    deleteProject: async (_, { id }) => {
      try {
        // First delete all tasks associated with this project
        await Task.deleteMany({ projectId: id });

        const project = await Project.findByIdAndDelete(id);
        if (!project) {
          throw new Error("Project not found");
        }

        return true;
      } catch (error) {
        throw new Error(`Error deleting project: ${error.message}`);
      }
    },

    // Task mutations
    createTask: async (_, { input }) => {
      try {
        // Verify project exists
        const project = await Project.findById(input.projectId);
        if (!project) {
          throw new Error("Project not found");
        }

        // Convert status if provided
        if (input.status) {
          input.status = convertTaskStatusToDB(input.status);
        }

        const task = new Task(input);
        await task.save();

        // Update project progress
        await project.calculateProgressFromTasks();
        await project.save();

        return task;
      } catch (error) {
        throw new Error(`Error creating task: ${error.message}`);
      }
    },

    updateTask: async (_, { id, input }) => {
      try {
        // Convert status if provided
        if (input.status) {
          input.status = convertTaskStatusToDB(input.status);
        }
        const task = await Task.findByIdAndUpdate(
          id,
          { ...input },
          { new: true, runValidators: true }
        );

        if (!task) {
          throw new Error("Task not found");
        }

        // Update project progress if status changed
        if (input.status) {
          await task.updateProjectProgress();
        }

        return task;
      } catch (error) {
        throw new Error(`Error updating task: ${error.message}`);
      }
    },

    deleteTask: async (_, { id }) => {
      try {
        const task = await Task.findByIdAndDelete(id);
        if (!task) {
          throw new Error("Task not found");
        }

        // Update project progress
        await task.updateProjectProgress();

        return true;
      } catch (error) {
        throw new Error(`Error deleting task: ${error.message}`);
      }
    },

    // Bulk operations
    bulkUpdateTaskStatus: async (_, { taskIds, status }) => {
      try {
        const tasks = await Task.find({ _id: { $in: taskIds } });
        if (tasks.length === 0) {
          throw new Error("No tasks found");
        }

        const updatedTasks = await Promise.all(
          taskIds.map(async (taskId) => {
            const task = await Task.findByIdAndUpdate(
              taskId,
              { status: convertTaskStatusToDB(status) },
              { new: true, runValidators: true }
            );

            if (task) {
              await task.updateProjectProgress();
            }

            return task;
          })
        );

        return updatedTasks.filter(Boolean);
      } catch (error) {
        throw new Error(`Error bulk updating tasks: ${error.message}`);
      }
    },
  },

  // Field resolvers for computed fields
  Project: {
    id: (parent) => parent._id,
    status: (parent) => convertProjectStatusFromDB(parent.status),
    daysRemaining: (parent) => {
      if (!parent.dueDate) return null;
      const now = new Date();
      const diffTime = new Date(parent.dueDate) - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    },
    taskCount: async (parent) => {
      return await Task.countDocuments({ projectId: parent._id });
    },
    completedTaskCount: async (parent) => {
      return await Task.countDocuments({
        projectId: parent._id,
        status: "done",
      });
    },
    tasks: async (parent) => {
      return await Task.find({ projectId: parent._id });
    },
  },

  Task: {
    id: (parent) => parent._id,
    projectId: (parent) => parent.projectId,
    status: (parent) => convertTaskStatusFromDB(parent.status),
    daysRemaining: (parent) => {
      if (!parent.dueDate) return null;
      const now = new Date();
      const diffTime = new Date(parent.dueDate) - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    },
    completionPercentage: (parent) => {
      if (parent.status === "done") return 100;
      if (parent.status === "in-progress") return 50;
      return 0;
    },
    project: async (parent) => {
      return await Project.findById(parent.projectId);
    },
  },
};
