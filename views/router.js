import express from "express";
import teamsController from "../controllers/teamsController.js";

const Router = express.Router();

Router.route("/teams")
  .get(teamsController.getAllTeams)
  .post(teamsController.createTeam);

Router.route("/teams/:id") // <-- placeholder for the team id
  .get(teamsController.getTeamById)
  .put(teamsController.updateTeamById)
  .delete(teamsController.deleteTeamById);

export default Router;