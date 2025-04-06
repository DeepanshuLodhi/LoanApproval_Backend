import { PrismaClient } from "../generated/prisma";
import express, { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Login endpoint
app.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;

    // Find user with provided email
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          password, // Note: In production, hash passwords
          role, // Set the role from request
        },
      });
      console.log(`New user created with email: ${email} and role: ${role}`);
    }

    // Return user information (excluding password)
    res.status(200).json({
      id: user?.id,
      email: user?.email,
      createdAt: user?.createdAt,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Application submission endpoint
app.post("/apply", async (req: Request, res: Response) => {
  try {
    const {
      fullName,
      amount,
      loanTenure,
      employmentStatus,
      reason,
      employmentAddress1,
      employmentAddress2,
      email,
    } = req.body;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(404).json({ error: "User not found. Please login first." });
    }

    // Create new application
    const application = await prisma.application.create({
      data: {
        name: fullName,
        amount: parseInt(amount),
        tenure: parseInt(loanTenure),
        employment_status: employmentStatus === "Employed",
        reason,
        address: employmentAddress2
          ? `${employmentAddress1}, ${employmentAddress2}`
          : employmentAddress1,
        email: user?.email || "",
      },
    });

    res.status(201).json({
      success: true,
      applicationId: application.id,
      message: "Application submitted successfully",
    });
  } catch (error) {
    console.error("Application submission error:", error);
    res.send({ error: "Failed to submit application" });
  }
});

app.get(
  "/applications/verifier/pending",
  async (req: Request, res: Response) => {
    try {
      const applications = await prisma.application.findMany({
        where: { application_status: "PENDING" },
        orderBy: { createdAt: "desc" },
      });

      res.status(200).json(applications);
    } catch (error) {
      console.error("Error fetching pending applications:", error);
      res.status(500).json({ error: "Failed to fetch pending applications" });
    }
  }
);

app.get("/applications/verifier", async (req: Request, res: Response) => {
  try {
    const applications = await prisma.application.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json(applications);
  } catch (error) {
    console.error("Error fetching applications for verifier:", error);
    res.status(500).json({ error: "Failed to fetch applications" });
  }
});

app.get("/applications/admin", async (req: Request, res: Response) => {
  try {
    const applications = await prisma.application.findMany({
      where: { application_status: "VERIFIED" },
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json(applications);
  } catch (error) {
    console.error("Error fetching applications for verifier:", error);
    res.status(500).json({ error: "Failed to fetch applications" });
  }
});

app.put(
  "/applications/verifier/update-status/:id",
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status, verifierEmail } = req.body;

      // Validate input
      if (!["PENDING", "VERIFIED", "REJECTED"].includes(status)) {
        res.status(400).json({
          error:
            "Invalid status. Status must be PENDING, VERIFIED, or REJECTED",
        });
      }

      // Verify the verifier has the correct role
      const verifier = await prisma.user.findUnique({
        where: { email: verifierEmail },
      });

      if (!verifier || verifier.role !== "verifier") {
        res.status(403).json({
          error: "Only verifiers can update application status",
        });
      }

      // Update the application status
      const updatedApplication = await prisma.application.update({
        where: { id: parseInt(id) },
        data: { application_status: status },
      });

      res.status(200).json({
        success: true,
        application: updatedApplication,
        message: `Application status updated to ${status}`,
      });
    } catch (error) {
      console.error("Error updating application status:", error);
      res.status(500).json({ error: "Failed to update application status" });
    }
  }
);

app.put(
  "/applications/admin/update-status/:id",
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status, adminEmail } = req.body;

      // Validate input
      if (!["PENDING", "VERIFIED", "REJECTED", "APPROVED"].includes(status)) {
        res.status(400).json({
          error:
            "Invalid status. Status must be PENDING, VERIFIED, or REJECTED",
        });
      }

      // Verify the verifier has the correct role
      const verifier = await prisma.user.findUnique({
        where: { email: adminEmail },
      });

      if (!verifier || verifier.role !== "admin") {
        res.status(403).json({
          error: "Only admin can update application status",
        });
      }

      // Update the application status
      const updatedApplication = await prisma.application.update({
        where: { id: parseInt(id) },
        data: { application_status: status },
      });

      res.status(200).json({
        success: true,
        application: updatedApplication,
        message: `Application status updated to ${status}`,
      });
    } catch (error) {
      console.error("Error updating application status:", error);
      res.status(500).json({ error: "Failed to update application status" });
    }
  }
);

// Get applications by email
app.get("/applications/:email", async (req: Request, res: Response) => {
  try {
    const { email } = req.params;

    const applications = await prisma.application.findMany({
      where: { email },
      orderBy: { createdAt: "desc" },
    });

    res.send(applications);
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.send({ error: "Failed to fetch applications" });
  }
});

// Root endpoint
app.get("/", (req: Request, res: Response) => {
  res.send("API is running");
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
