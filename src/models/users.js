var bcrypt = require('bcryptjs');

const user = (sequelize, DataTypes) => {
  const User = sequelize.define('user', {
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: 'Email cannot be empty',
        },
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [7,42],
      }
    }
  });

  User.associate = models => {
    User.hasMany(models.Message, { onDelete: 'CASCADE' });
    /*
    Now, in case a user is deleted, we may want to perform a
    so called cascade delete for all messages in relation to 
    the user. That’s why you can extend schemas with a CASCADE 
    flag. In this case, we add the flag to our user schema to 
    remove all messages of this user on its deletion.
    */
  };

  User.findByLogin = async login => {
    let user = await User.findOne({
      where: { username: login },
    });

    if (!user) {
      user = await User.findOne({
        where: { email: login }
      });
    }

    return user;
  };

  User.beforeCreate(user => {
    user.password = await user.generatePasswordHash();
  });

  User.prototype.generatePasswordHash = async function() {
    /*
    In this implementation, the generatePasswordHash() function is 
    added to the user’s prototype chain. That’s why it is possible 
    to execute the function as method on each user instance, so you 
    have the user itself available within the method as this. You 
    can also take the user instance with its password as an argument, 
    which I prefer, though using JavaScript’s prototypal inheritance 
    a good tool for any web developer. For now, the password is hashed 
    with bcrypt before it gets stored every time a user is created in 
    the database.
    */
    const saltRounds = 10;
    return await bcrypt.hash(this.password, saltRounds);
    /*
    The bcrypt hash() method takes a string–the user’s password–and 
    an integer called salt rounds. Each salt round makes it more 
    costly to hash the password, which makes it more costly for 
    attackers to decrypt the hash value. A common value for salt 
    rounds nowadays ranged from 10 to 12, as increasing the number of 
    salt rounds might cause performance issues both ways.
    */
  }

  return User;
};

export default user;