import joi from "joi";

// A FootballFriends team must have a name, a manager,
// a format (5, 7 or 11-a-side) and a list of player names.
const teamSchema = joi.object({
  id: joi.string().required(),
  team_name: joi.string().required(),
  manager: joi.string().required(),
  team_format: joi.number().valid(5, 7, 11).required(),
  players: joi.array().items(joi.string()).required(),
});

export default teamSchema;