const db = require('../db');

module.exports = async (params, limit, offset) => {
  switch(params.type){
    case "beach":
      switch(params.count){
        case 1:
          return [
            {
              id:1,
              name:"No name",
            },
          ];
        break;
        case 2:
          return [
            {
              id:1,
              name:"Near sea",
            },
            {
              id:2,
              name:"Far from sea",
            }
          ];
        break;
        case 3:
          return [
            {
              id:1,
              name:"Near sea",
            },
            {
              id:2,
              name:"Middle",
            },
            {
              id:3,
              name:"Far from sea",
            }
          ];
        break;
        case 4:
          return [
            {
              id:1,
              name:"Near sea",
            },
            {
              id:2,
              name:"Middle1",
            },
            {
              id:3,
              name:"Middle2",
            },
            {
              id:4,
              name:"Far from sea",
            },
          ];
        break;
      }
      break;
    }
  return [
  ];
};
