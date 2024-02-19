exports.serverErrors = (err, request, response, next) => {
    console.log(err);
    response.status(500).send({ msg: "Internal server error" });
  };