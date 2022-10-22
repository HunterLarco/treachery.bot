async function fetchAll(environment, ids) {
  return Promise.all(
    [...ids].map((id) => environment.discord.client.users.fetch(id))
  );
}

module.exports = {
  fetchAll,
};
