import express, { Request, Response } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";
import { User } from "../models/user";
import { BadRequestError } from "../errors/bad-request-error";
import { validateRequest } from "../middlewares/validate-request";
const router = express.Router();

router.post(
  "/api/users/signup",
  [
    body("email").isEmail().withMessage("Email must be valid."),
    body("password")
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage("Passsword must be between 4 and 20 character length."),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // checking if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new BadRequestError("Email already in use");
    }

    // creating a user in DB

    const user = User.build({
      email,
      password,
    });

    await user.save();

    //generating jwt

    const userJwt = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_KEY!
    );

    // storing jwt token on session cookie
    req.session = {
      jwt: userJwt,
    };

    res.status(201).send(user);
  }
);

export { router as signUpRouter };
