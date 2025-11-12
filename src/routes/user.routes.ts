import { Router } from "express"
import * as userController from "../controllers/user.controller.js"
import { validateDto } from "../middlewares/validate.dto.js"
import { CreateUserDto } from "../dtos/create-user.dto.js"
import { UpdateUserDto } from "../dtos/update-user.dto.js"

const router = Router()
router.post("/users", validateDto(CreateUserDto), userController.createUser)
router.get("/users", userController.getAllUsers)
router.get("/users/:id", userController.getUserById)
router.put("/users/:id", validateDto(UpdateUserDto), userController.updateUser)
router.delete("/users/:id", userController.deleteUser)

export default router
