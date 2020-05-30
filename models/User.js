const bcrypt = require("bcryptjs");

module.exports = function (sequelize, DataTypes) {
	const User = sequelize.define("User",
		{
			username: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true,
				validate: {
					len: [3]
				}
			},
			// The password cannot be null
			password: {
				type: DataTypes.STRING,
				allowNull: false,
				validate: {
					len: [8]
				}
			}
		}
	);

	User.associate = models => {
		User.hasMany(models.Note);
	}
	// Hooks are automatic methods that run during various phases of the User Model lifecycle
	// In this case, before a User is created, we will automatically hash their password
	User.addHook("beforeCreate", function (user) {
		user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10), null);
	});
	return User;
};