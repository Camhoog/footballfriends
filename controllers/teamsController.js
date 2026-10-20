import database from "../services/database.js";
import {
  ScanCommand,
  PutCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import teamSchema from "../models/team.js";

const tableName = "FootballFriendsTeams";

async function getAllTeams(req, res, next) {
  try {
    const params = {
      TableName: tableName,
    };
    const command = new ScanCommand(params);
    const result = await database.send(command);
    res.status(200).json(result.Items);
  } catch (err) {
    next(err);
  }
}

async function createTeam(req, res, next) {
  try {
    const uuid = uuidv4();
    req.body.id = uuid;
    const { error, value } = teamSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { id, team_name, manager, team_format, players } = value;

    // A 5-a-side team needs 5 players, 7-a-side needs 7, 11-a-side needs 11
    if (players.length !== team_format) {
      return res.status(400).json({
        error:
          "A " + team_format + "-a-side team needs exactly " + team_format +
          " players. You sent " + players.length + ".",
      });
    }

    const params = {
      TableName: tableName,
      Item: {
        id,
        team_name,
        manager,
        team_format,
        players,
      },
    };

    const command = new PutCommand(params);
    await database.send(command);

    res
      .status(201)
      .json({ message: "Successfully created team", data: params.Item });
  } catch (err) {
    next(err);
  }
}

async function getTeamById(req, res, next) {
  const teamId = req.params.id;
  try {
    const params = {
      TableName: tableName,
      Key: { id: teamId },
    };
    const command = new GetCommand(params);
    const result = await database.send(command);
    if (!result.Item) {
      return res.status(404).json({ message: "No team found" });
    }
    res.status(200).json(result.Item);
  } catch (err) {
    next(err);
  }
}

async function updateTeamById(req, res, next) {
  try {
    const teamId = req.params.id;
    req.body.id = teamId;
    const { error, value } = teamSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { team_name, manager, team_format, players } = value;

    if (players.length !== team_format) {
      return res.status(400).json({
        error:
          "A " + team_format + "-a-side team needs exactly " + team_format +
          " players. You sent " + players.length + ".",
      });
    }

    // Check the team exists before updating it
    const getParams = {
      TableName: tableName,
      Key: { id: teamId },
    };
    const getCommand = new GetCommand(getParams);
    const result = await database.send(getCommand);

    if (!result.Item) {
      return res.status(404).json({ message: "No team found" });
    }

    // Update the team in DynamoDB
    const updateParams = {
      TableName: tableName,
      Key: { id: teamId },
      UpdateExpression:
        "set #team_name = :team_name, #manager = :manager, #team_format = :team_format, #players = :players",
      ExpressionAttributeNames: {
        "#team_name": "team_name",
        "#manager": "manager",
        "#team_format": "team_format",
        "#players": "players",
      },
      ExpressionAttributeValues: {
        ":team_name": team_name,
        ":manager": manager,
        ":team_format": team_format,
        ":players": players,
      },
      ReturnValues: "ALL_NEW",
    };
    const updateCommand = new UpdateCommand(updateParams);
    const updatedTeam = await database.send(updateCommand);

    res.status(200).json(updatedTeam.Attributes);
  } catch (err) {
    next(err);
  }
}

async function deleteTeamById(req, res, next) {
  const teamId = req.params.id;
  try {
    const params = {
      TableName: tableName,
      Key: { id: teamId },
    };
    const command = new DeleteCommand(params);
    await database.send(command);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

export default {
  getAllTeams,
  createTeam,
  getTeamById,
  updateTeamById,
  deleteTeamById,
};