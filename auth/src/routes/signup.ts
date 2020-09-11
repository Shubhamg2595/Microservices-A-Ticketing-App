import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";

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
  (req: Request, res: Response) => {
    const errors = validationResult(req);  

    if (!errors.isEmpty()) {
      return res.status(400).send(errors.array());
    }

    const { email, password } = req.body;

    console.log("Create a user here...");

    res.send({});
  }
);

export { router as signUpRouter };
