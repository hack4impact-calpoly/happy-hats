module.exports = {
    checkUpdateResult: (res, expected_num_updated = 1) => {
        return res.ok && res.n === expected_num_updated;
    },
};