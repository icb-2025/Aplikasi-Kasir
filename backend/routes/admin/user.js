// routes/admin/user.js
import express from 'express'
import { getUsers, addUser, updateUser, deleteUser } from '../../controllers/admin/usercontroller.js'

const router = express.Router()

router.get("/", getUsers)
router.post("/create", addUser)
router.put("/:id", updateUser)
router.delete("/:id", deleteUser)

export default router