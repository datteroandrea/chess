let crypto = require('crypto');
let jobs = { };

module.exports = {
    addJob(task, seconds) {
        let jobId = crypto.randomUUID();
        jobs[jobId] = setTimeout(task, seconds * 1000);
        return jobId;
    },
    removeJob(jobId) {
        clearTimeout(jobs[jobId]);
        delete(jobs[jobId]);
    }
};