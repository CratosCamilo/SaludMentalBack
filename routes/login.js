const express = require("express");
const { User, UserAdmin, UserDoctor, UserSecretary, Pacient } = require("../schema/user");
const { jsonResponse } = require("../lib/jsonResponse");
const getUserInfo = require("../lib/getUserInfo");
const router = express.Router();

router.post("/", async function (req, res, next) {
  const { username, password } = req.body;

  try {
    const userExists = await User.usernameExists(username);

    if (userExists) {
      const user = await User.getUserByCC(username); // 

      const passwordCorrect = await User.isCorrectPassword(username, password);

      if (passwordCorrect) {
        const accessToken = User.createAccessToken(user);
        const refreshToken = await User.createRefreshToken(user);


        return res.json(
          jsonResponse(200, {
            accessToken,
            refreshToken,
            user: getUserInfo(user),
          })
          
        );
      } else {
        return res.status(401).json(
          jsonResponse(401, {
            error: "username and/or password incorrect",
          })
        );
      }
    } else {
      return res.status(401).json(
        jsonResponse(401, {
          error: "username does not exist",
        })
      );
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json(
      jsonResponse(500, {
        error: "Internal server error",
      })
    );
  }
});

module.exports = router;
 