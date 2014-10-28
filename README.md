# LSCM / CLEAR

## Prerequisite

#### For project versionning: 

- Install Git: http://git-scm.com/

#### For automations: 

- Install Node and Npm: http://nodejs.org/
- Install Grunt: http://gruntjs.com/
- Install Bower: http://bower.io/

For Sass files compilation: 

- Install Ruby: for windows, select v. 1.9.3 http://rubyinstaller.org/
- Install Sass: `$ gem install sass`
- Install Compass: `$ gem install compass` 

## Installation

#### Clone repository on your computer: 

    $ git clone https://github.com/desgnl/lscm-clear.git

#### Install dependencies: 

From the directory you just cloned. 

    $ npm install

#### Set credentials for ftp

At the root of the project, create a file `.ftppass`. Complete the file with your credentials: 

   {
     "ofon2": {
       "username": "your_login",
       "password": "your_password"
     }
   }

##  Grunt commands

#### Start local server

   $ grunt serve

#### Update Npm dependencies (Grunt tasks)

   $ grunt dep

#### Update project dependencies (Angular, Bootstrap, etc.)

   $ grunt install

#### Compile Sass files

    $ grunt

#### Make production build (/app directory)

    $ grunt app

#### Deploy production build via ftp

   $ grunt deploy
