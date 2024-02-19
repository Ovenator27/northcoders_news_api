exports.customErrors = (err, request, response, next) => {
  if (err.status && err.msg) {
    response.status(err.status).send({ msg: err.msg });
  } else next(err);
};

exports.psqlErrors = (err, request, response, next) => {
  if (err.code === "22P02") {
    response.status(400).send({msg: 'Bad request'})
  } else next(err)
};

exports.serverErrors = (err, request, response, next) => {
  console.log(err);
  response.status(500).send({ msg: "Internal server error" });
};
