// server/routes.ts
import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";

import { storage } from "./storage";
import { isAuthenticated } from "./auth";
import {
  insertEmployeeSchema,
  updateEmployeeSchema,
  insertTaskSchema,
  updateTaskSchema,
} from "@shared/schema";
import { z } from "zod";

/** Helper: validate numeric id params */
function parseId(value: unknown): number | null {
  const n = Number(value);
  if (Number.isInteger(n) && n > 0) return n;
  return null;
}

/** Helper: normalize and validate incoming date-like values
 * - undefined => undefined (field omitted)
 * - null => null (explicit null)
 * - valid Date => Date
 * - valid timestamp (number) => Date
 * - valid ISO/string parseable => Date
 * - invalid => null (caller should treat as invalid)
 */
function toValidDate(value: unknown): Date | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;

  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === "number") {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }

  if (typeof value === "string") {
    const s = value.trim();
    if (s === "") return null;
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  }

  return null;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.get("/api/auth/user", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // req.user is provided by auth; narrow with `as any` but explicit about type
      const userId = (req as any).user?.claims?.sub as string | undefined;
      if (!userId) return res.status(401).json({ message: "Unauthenticated" });
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // ==================== EMPLOYEE ROUTES ====================
  // Get all employees
  app.get("/api/employees", isAuthenticated, async (_req: Request, res: Response) => {
    try {
      const employees = await storage.getEmployees();
      res.json(employees);
    } catch (error) {
      console.error("Error fetching employees:", error);
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });

  // Get single employee
  app.get("/api/employees/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseId(req.params.id);
      if (!id) return res.status(400).json({ message: "Invalid employee id" });

      const employee = await storage.getEmployee(id);
      if (!employee)
        return res.status(404).json({ message: "Employee not found" });
      res.json(employee);
    } catch (error) {
      console.error("Error fetching employee:", error);
      res.status(500).json({ message: "Failed to fetch employee" });
    }
  });

  // Create employee
  app.post("/api/employees", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const employeeData = insertEmployeeSchema.parse(req.body);
      const employee = await storage.createEmployee(employeeData);
      res.status(201).json(employee);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid employee data", errors: error.errors });
      }
      console.error("Error creating employee:", error);
      res.status(500).json({ message: "Failed to create employee" });
    }
  });

  // Update employee
  app.put("/api/employees/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseId(req.params.id);
      if (!id) return res.status(400).json({ message: "Invalid employee id" });

      const employeeData = updateEmployeeSchema.parse(req.body);
      const employee = await storage.updateEmployee(id, employeeData);
      if (!employee)
        return res.status(404).json({ message: "Employee not found" });
      res.json(employee);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid employee data", errors: error.errors });
      }
      console.error("Error updating employee:", error);
      res.status(500).json({ message: "Failed to update employee" });
    }
  });

  // Delete employee
  app.delete("/api/employees/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseId(req.params.id);
      if (!id) return res.status(400).json({ message: "Invalid employee id" });

      const deleted = await storage.deleteEmployee(id);
      if (!deleted)
        return res.status(404).json({ message: "Employee not found" });
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting employee:", error);
      res.status(500).json({ message: "Failed to delete employee" });
    }
  });

  // ==================== TASK ROUTES ====================
  // Get all tasks (with optional filters)
  app.get("/api/tasks", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // accept employeeId or employee_id
      const rawEmployeeId = (req.query.employeeId ?? req.query.employee_id) as unknown;
      const employeeId = rawEmployeeId ? (parseId(rawEmployeeId) ?? undefined) : undefined;
      const status =
        typeof req.query.status === "string"
          ? (req.query.status as string)
          : undefined;

      const tasks = await storage.getTasks(employeeId, status);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  // Get single task
  app.get("/api/tasks/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseId(req.params.id);
      if (!id) return res.status(400).json({ message: "Invalid task id" });

      const task = await storage.getTask(id);
      if (!task) return res.status(404).json({ message: "Task not found" });
      res.json(task);
    } catch (error) {
      console.error("Error fetching task:", error);
      res.status(500).json({ message: "Failed to fetch task" });
    }
  });

  // Create task
  app.post("/api/tasks", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const rawDue = req.body?.dueDate;
      const due = toValidDate(rawDue);

      // If client provided something non-null/undefined but parsing failed -> reject
      if (rawDue !== undefined && rawDue !== null && due === null) {
        return res.status(400).json({ message: "Invalid dueDate" });
      }

      const parsed = {
        ...req.body,
        // For creation we preserve null when client sent null; otherwise use Date or null
        dueDate: due ?? null,
      };
      const taskData = insertTaskSchema.parse(parsed);
      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid task data", errors: error.errors });
      }
      console.error("Error creating task:", error);
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  // Update task
  app.put("/api/tasks/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseId(req.params.id);
      if (!id) return res.status(400).json({ message: "Invalid task id" });

      const rawDue = req.body?.dueDate;
      const due = toValidDate(rawDue);

      // If client explicitly provided a value (not omitted) but parsing failed -> reject
      const hasDueProp = Object.prototype.hasOwnProperty.call(req.body ?? {}, "dueDate");
      if (hasDueProp && rawDue !== undefined && rawDue !== null && due === null) {
        return res.status(400).json({ message: "Invalid dueDate" });
      }

      const parsed = {
        ...req.body,
        // only set dueDate when the client included the property; otherwise leave undefined
        dueDate: hasDueProp ? due : undefined,
      };
      const taskData = updateTaskSchema.parse(parsed);
      const task = await storage.updateTask(id, taskData);
      if (!task) return res.status(404).json({ message: "Task not found" });
      res.json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid task data", errors: error.errors });
      }
      console.error("Error updating task:", error);
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  // Delete task
  app.delete("/api/tasks/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseId(req.params.id);
      if (!id) return res.status(400).json({ message: "Invalid task id" });

      const deleted = await storage.deleteTask(id);
      if (!deleted) return res.status(404).json({ message: "Task not found" });
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // ==================== DASHBOARD ROUTE ====================
  // Get dashboard stats
  app.get("/api/dashboard", isAuthenticated, async (_req: Request, res: Response) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
