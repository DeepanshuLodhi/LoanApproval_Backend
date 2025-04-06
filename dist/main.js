"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../generated/prisma");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const app = (0, express_1.default)();
const prisma = new prisma_1.PrismaClient();
// Middleware
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
// Login endpoint
app.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, role } = req.body;
        // Find user with provided email
        let user = yield prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            user = yield prisma.user.create({
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
            id: user === null || user === void 0 ? void 0 : user.id,
            email: user === null || user === void 0 ? void 0 : user.email,
            createdAt: user === null || user === void 0 ? void 0 : user.createdAt,
            message: "Login successful",
        });
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}));
// Application submission endpoint
app.post("/apply", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fullName, amount, loanTenure, employmentStatus, reason, employmentAddress1, employmentAddress2, email, } = req.body;
        // Check if user exists
        const user = yield prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            res.status(404).json({ error: "User not found. Please login first." });
        }
        // Create new application
        const application = yield prisma.application.create({
            data: {
                name: fullName,
                amount: parseInt(amount),
                tenure: parseInt(loanTenure),
                employment_status: employmentStatus === "Employed",
                reason,
                address: employmentAddress2
                    ? `${employmentAddress1}, ${employmentAddress2}`
                    : employmentAddress1,
                email: (user === null || user === void 0 ? void 0 : user.email) || "",
            },
        });
        res.status(201).json({
            success: true,
            applicationId: application.id,
            message: "Application submitted successfully",
        });
    }
    catch (error) {
        console.error("Application submission error:", error);
        res.send({ error: "Failed to submit application" });
    }
}));
app.get("/applications/verifier/pending", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const applications = yield prisma.application.findMany({
            where: { application_status: "PENDING" },
            orderBy: { createdAt: "desc" },
        });
        res.status(200).json(applications);
    }
    catch (error) {
        console.error("Error fetching pending applications:", error);
        res.status(500).json({ error: "Failed to fetch pending applications" });
    }
}));
app.get("/applications/verifier", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const applications = yield prisma.application.findMany({
            orderBy: { createdAt: "desc" },
        });
        res.status(200).json(applications);
    }
    catch (error) {
        console.error("Error fetching applications for verifier:", error);
        res.status(500).json({ error: "Failed to fetch applications" });
    }
}));
app.get("/applications/admin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const applications = yield prisma.application.findMany({
            where: { application_status: "VERIFIED" },
            orderBy: { createdAt: "desc" },
        });
        res.status(200).json(applications);
    }
    catch (error) {
        console.error("Error fetching applications for verifier:", error);
        res.status(500).json({ error: "Failed to fetch applications" });
    }
}));
app.put("/applications/verifier/update-status/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { status, verifierEmail } = req.body;
        // Validate input
        if (!["PENDING", "VERIFIED", "REJECTED"].includes(status)) {
            res.status(400).json({
                error: "Invalid status. Status must be PENDING, VERIFIED, or REJECTED",
            });
        }
        // Verify the verifier has the correct role
        const verifier = yield prisma.user.findUnique({
            where: { email: verifierEmail },
        });
        if (!verifier || verifier.role !== "verifier") {
            res.status(403).json({
                error: "Only verifiers can update application status",
            });
        }
        // Update the application status
        const updatedApplication = yield prisma.application.update({
            where: { id: parseInt(id) },
            data: { application_status: status },
        });
        res.status(200).json({
            success: true,
            application: updatedApplication,
            message: `Application status updated to ${status}`,
        });
    }
    catch (error) {
        console.error("Error updating application status:", error);
        res.status(500).json({ error: "Failed to update application status" });
    }
}));
app.put("/applications/admin/update-status/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { status, adminEmail } = req.body;
        // Validate input
        if (!["PENDING", "VERIFIED", "REJECTED", "APPROVED"].includes(status)) {
            res.status(400).json({
                error: "Invalid status. Status must be PENDING, VERIFIED, or REJECTED",
            });
        }
        // Verify the verifier has the correct role
        const verifier = yield prisma.user.findUnique({
            where: { email: adminEmail },
        });
        if (!verifier || verifier.role !== "admin") {
            res.status(403).json({
                error: "Only admin can update application status",
            });
        }
        // Update the application status
        const updatedApplication = yield prisma.application.update({
            where: { id: parseInt(id) },
            data: { application_status: status },
        });
        res.status(200).json({
            success: true,
            application: updatedApplication,
            message: `Application status updated to ${status}`,
        });
    }
    catch (error) {
        console.error("Error updating application status:", error);
        res.status(500).json({ error: "Failed to update application status" });
    }
}));
// Get applications by email
app.get("/applications/:email", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.params;
        const applications = yield prisma.application.findMany({
            where: { email },
            orderBy: { createdAt: "desc" },
        });
        res.send(applications);
    }
    catch (error) {
        console.error("Error fetching applications:", error);
        res.send({ error: "Failed to fetch applications" });
    }
}));
// Root endpoint
app.get("/", (req, res) => {
    res.send("API is running");
});
// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
