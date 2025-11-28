import {
  users,
  employees,
  tasks,
  type User,
  type UpsertUser,
  type Employee,
  type InsertEmployee,
  type UpdateEmployee,
  type Task,
  type InsertTask,
  type UpdateTask,
  type DashboardStats,
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User methods (for auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Employee methods
  getEmployees(): Promise<Employee[]>;
  getEmployee(id: number): Promise<Employee | undefined>;
  createEmployee(data: InsertEmployee): Promise<Employee>;
  updateEmployee(
    id: number,
    data: UpdateEmployee,
  ): Promise<Employee | undefined>;
  deleteEmployee(id: number): Promise<boolean>;

  // Task methods
  getTasks(employeeId?: number, status?: string): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(data: InsertTask): Promise<Task>;
  updateTask(id: number, data: UpdateTask): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;

  // Dashboard
  getDashboardStats(): Promise<DashboardStats>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Employee methods
  async getEmployees(): Promise<Employee[]> {
    return await db.select().from(employees).orderBy(employees.name);
  }

  async getEmployee(id: number): Promise<Employee | undefined> {
    const [employee] = await db
      .select()
      .from(employees)
      .where(eq(employees.id, id));
    return employee;
  }

  async createEmployee(data: InsertEmployee): Promise<Employee> {
    const [employee] = await db.insert(employees).values(data).returning();
    return employee;
  }

  async updateEmployee(
    id: number,
    data: UpdateEmployee,
  ): Promise<Employee | undefined> {
    const [employee] = await db
      .update(employees)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(employees.id, id))
      .returning();
    return employee;
  }

  async deleteEmployee(id: number): Promise<boolean> {
    const result = await db
      .delete(employees)
      .where(eq(employees.id, id))
      .returning();
    return result.length > 0;
  }

  // Task methods
  async getTasks(employeeId?: number, status?: string): Promise<Task[]> {
    const q = db.select().from(tasks);

    if (employeeId && status) {
      return await q
        .where(and(eq(tasks.employeeId, employeeId), eq(tasks.status, status)))
        .orderBy(tasks.createdAt);
    } else if (employeeId) {
      return await q
        .where(eq(tasks.employeeId, employeeId))
        .orderBy(tasks.createdAt);
    } else if (status) {
      return await q.where(eq(tasks.status, status)).orderBy(tasks.createdAt);
    }

    return await q.orderBy(tasks.createdAt);
  }

  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async createTask(data: InsertTask): Promise<Task> {
    const [task] = await db.insert(tasks).values(data).returning();
    return task;
  }

  async updateTask(id: number, data: UpdateTask): Promise<Task | undefined> {
    const [task] = await db
      .update(tasks)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning();
    return task;
  }

  async deleteTask(id: number): Promise<boolean> {
    const result = await db.delete(tasks).where(eq(tasks.id, id)).returning();
    return result.length > 0;
  }

  // Dashboard - returns comprehensive stats (optimized: parallel queries)
  async getDashboardStats(): Promise<DashboardStats> {
    // Fetch basic lists in parallel
    const [allTasks, allEmployees] = await Promise.all([
      db.select().from(tasks),
      db.select().from(employees),
    ]);

    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(
      (t) => t.status === "completed",
    ).length;
    const pendingTasks = allTasks.filter((t) => t.status === "pending").length;
    const inProgressTasks = allTasks.filter(
      (t) => t.status === "in-progress",
    ).length;
    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const tasksByPriority = {
      high: allTasks.filter((t) => t.priority === "high").length,
      medium: allTasks.filter((t) => t.priority === "medium").length,
      low: allTasks.filter((t) => t.priority === "low").length,
    };

    // Build tasks by employee - include all employees even those with 0 tasks
    const employeeTaskCounts = new Map<number, number>();
    for (const task of allTasks) {
      if (task.employeeId) {
        const count = employeeTaskCounts.get(task.employeeId) || 0;
        employeeTaskCounts.set(task.employeeId, count + 1);
      }
    }

    const tasksByEmployee = allEmployees.map((emp) => ({
      employeeId: emp.id,
      employeeName: emp.name,
      taskCount: employeeTaskCounts.get(emp.id) || 0,
    }));

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      completionRate,
      totalEmployees: allEmployees.length,
      tasksByPriority,
      tasksByEmployee,
    };
  }
}

export const storage = new DatabaseStorage();
