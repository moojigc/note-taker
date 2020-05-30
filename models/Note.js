module.exports = function (sequelize, DataTypes) {
	const Note = sequelize.define("Note",
		{
			title: {
				type: DataTypes.STRING,
				allowNull: false,
				validate: {
					len: [1]
				}
			},
			body: {
				type: DataTypes.STRING,
				validate: {
					len: [1, 140000]
				}
			}
		}
	);

	Note.associate = models => {
		Note.belongsTo(models.User, {
			foreignKey: {
				allowNull: false
			},
			onDelete: "CASCADE"
		});
    }
    return Note;
};