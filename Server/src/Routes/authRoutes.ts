import express from 'express'
import { signup ,login, logout } from '../Controllers/authControllers'
import { authorize } from '../Middleware/authorize'

const route = express.Router()

route.post("/signup",signup)
route.post("/login",login)
route.get("/logout",authorize,logout)

export default route