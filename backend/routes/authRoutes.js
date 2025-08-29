import express from "express"
import {login} from "../auth/Login.js"
import {register} from "../auth/Register.js"

const router = express()

router.post("/login", login)
router.post("/register", register)

export default router