var model = require('../model'),
	thread = model.thread,
	board = require('./board'),
	user = require('./user'),
	async = require('async');

// list thread
exports.ls = function(cb) {
	thread.find({}).exec(function(err, threads) {
		if (!err) {
			cb(null,threads)
		} else {
			cb(err);
		}
	});
}

// list thread by board id
exports.lsByBoardId = function(bid,params,cb) {
	thread.find({
		board: bid
	}).limit(params.limit).populate('lz').populate('board').exec(function(err, threads) {
		if (!err) {
			cb(null,threads)
		} else {
			cb(err);
		}
	});
}

// 查看当前用户是否是楼主
exports.checkLz = function(tid, uid, cb) {
	thread.findById(tid).exec(function(err, thread) {
		if (!err) {
			if (thread) {
				if (thread.lz == uid) {
					cb(null,true,thread)
				} else {
					cb(null,false)
				}
			} else {
				cb(null,false)
			}
		} else {
			cb(err)
		}
	});
}

exports.read = function(id, cb) {
	thread.findById(id).populate('lz').populate('board').exec(function(err, thread) {
		if (!err) {
			cb(null,thread)
		} else {
			cb(err)
		}
	});
}

exports.create = function(baby, cb) {
	var baby = new thread(baby);
	async.waterfall([
		function(callback) {
			baby.save(function(err) {
				if (!err) {
					callback(null, baby);
				} else {
					cb(err);
				}
			});
		},
		function(baby, callback) {
			board.brief(baby.board,function(err,b){
				if (!err) {
					b.threads.push(baby._id);
					b.save(function(err){
						if (!err) {
							callback(null, baby)
						} else {
							cb(err);
						}
					})
				} else {
					cb(err)
				}
			})
		},
		function(baby, callback) {
			user.queryById(baby.lz,function(err,u){
				if (!err) {
					u.threads.push(baby._id);
					u.save(function(err){
						if (!err) {
							cb(null,baby);
						} else {
							cb(err);
						}
					})
				} else {
					cb(err)
				}
			})
		}
	],function(err,baby){
		cb(err,baby)
	});
}

exports.update = function(id, body, cb) {
	thread.findByIdAndUpdate(id, body, function(err) {
		if (!err) {
			cb(null,body);
		} else {
			cb(err)
		}
	})
}

// 删除之后要删除在相应board的索引？
exports.remove = function(id) {
	thread.findByIdAndRemove(id,function(err){
		if (!err) {
			cb(null,id)
		} else {
			cb(err)
		}
	})
}