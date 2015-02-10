    
    var Game = function () {
    
        this.init();
    
    }
    
    Game.prototype = {
        user: {
            level: 1,
            exp: 0,
            heat: 0,
            maxHeat: 10,
            health: 100,
            maxHealth: 100,
            cash: 100, 
            inventory: [
                {name: "Butter Knife", qty:1, att:1, def:0},
                {name: "hoodie", qty: 1, def:1, att: 0}
            ]
        },
        reset: function () {
            var self = this;
            
            localStorage.removeItem(self.settings.game.saveName);
            document.location.reload();
            
        },
        settings: {
            game: {
                saveName: "cday_JS_mafia_game"
            },
            timers:{
                heatTimer: 15, 
                saveTimer: 60
            },
            elements: {
                cash: $("[data-user-stat='cash']"), 
                heat: $("[data-user-stat='heat']"),
                level: $("[data-user-stat='level']"),
                maxHeat: $("[data-user-stat='max-heat']"), 
                crimes: $(".crimes"),
                log: $(".log"), 
                gameTime:$('[data-timer="game"]'), 
                exp:$($("[data-user-stat='exp']"))
            }, 
            crimes: [
                {name:"Steal Candy", heat:1, cash: 7, exp: 1},
                {name:"Rob a child", heat:2, cash: 15, exp: 2},
                {name:"Rob a Store", heat:5, cash: 30, exp: 3},
                {name:"Sell weed to teenagers", heat:10, cash: 50, exp: 5}
            ], 
            ranks: [0, 5, 10, 30, 100, 250, 500, 1000, 1750, 3000, 6000, 10000, 20000, 50000, 100000, 250000, 500000, 1000000]
        }
        ,timers: {
            heat: '',
            save: '', 
            gameTime: ''
        }
        ,init: function () {
            
            var self = this;
            
            /* Draw the game */
            self.drawGameElements();
            
            /* Load existing Game */
            self.loadGame();
            
            /* start the timers */
            self.startTimers();
            
        }
        ,loadGame: function () {
            
            var self = this;
            if (typeof localStorage[self.settings.game.saveName] != 'undefined') {
            
                var load = JSON.parse(localStorage[self.settings.game.saveName])
            
                self.user = load;
                self.log("Game Loaded", "#009")
            }
            
            self.drawUserStats();
            
        }
        ,saveGame: function () {
            
            var self = this;
            
            localStorage.setItem(self.settings.game.saveName, JSON.stringify(self.user));
            
            self.log("Game Saved", "#009")
                
        }
        ,drawGameElements: function () {
        
            var self = this;
            
            /* Load up the user stats */
            self.drawUserStats();
            
            for (var obj in self.settings.crimes) {
            
                self.settings.elements.crimes.append('<li><a href="#" onClick="game.commitCrime('+obj+')">'+self.settings.crimes[obj]["name"]+' ('+self.settings.crimes[obj]["heat"]+' Heat)</a></li>');
                
            }
            
        }
        ,drawUserStats: function () {
            
            var self = this;
            
            self.settings.elements.cash.html(self.user.cash);
            self.settings.elements.heat.html(self.user.heat);
            self.settings.elements.level.html(self.user.level);
            self.settings.elements.maxHeat.html(self.user.maxHeat);
            
            /* Calculate percentage to the next level */
            var nextLevel = self.settings.ranks[self.user.level];
            var thisLevel = self.settings.ranks[(self.user.level - 1)]
            
            var perc = (self.user.exp - thisLevel) / (nextLevel - thisLevel);
            
            perc *= 100;
            
            perc = Math.round((perc*100));
            
            perc /= 100;
            
            self.settings.elements.exp.html(perc+"%");
            
        }
        ,getLevel: function () {
            var self = this, i = 0,  orig = self.user.level;
            
            for (var obj in self.settings.ranks) {
                if (self.settings.ranks[obj] <= self.user.exp) {
                    i++;
                }
            }
            if (i > orig) {
                self.log("You have Leveled Up!");
            }
            return i;
        }
        ,updateHeat: function (val) {
            var self = this;
            
            self.user.heat = ((self.user.heat+val) > 0?self.user.heat+val:0); 
            
            if (self.user.heat > self.user.maxHeat) {
                self.user.heat = self.user.maxHeat;
            }
            
            self.drawUserStats();
            
            return self;
        }
        ,updateCash: function (val) {
            var self = this;
            
            self.user.cash += val; 
            self.drawUserStats();
            
            return self;
        }
        ,updateExp: function (val) {
        
            var self = this;
            
            self.user.exp += val;
            
            var level = self.getLevel();
            self.user.level = level;
            self.user.maxHeat = (level*5) + 5;
            
            self.drawUserStats();
            
            return self;
            
        }
        ,commitCrime: function (crime) {
        
            var self = this;
            
            var crime = self.settings.crimes[crime];
            
            if ((self.user.heat + crime.heat) <= self.user.maxHeat) {
                self.updateHeat(crime.heat).updateCash(crime.cash).updateExp(crime.exp);
                self.log("You commited a crime and gained $"+crime.cash+" but your heat increased by "+crime.heat+"!", "#090")
            } else {
                self.log("The cops are watching you, better wait a while!", "#900")
            }
            
        }
        ,startTimers: function () {
            var self = this;
        
            /* Start The Heat Timer */ 
            self.timers.heat = setInterval(function () {
                self.updateHeat(-1);
            }, self.settings.timers.heatTimer * 1000);
        
            
            /* Start The Save Timer */ 
            self.timers.save = setInterval(function () {
                self.saveGame();
            }, self.settings.timers.saveTimer * 1000);
            
            
            /* Start The Game Timer */ 
            self.timers.save = setInterval(function () {
                self.settings.elements.gameTime.html(self.getTime());
            }, 1000);
        },
        log: function (text, color) {
        
            var self = this;
            
            if (typeof color == 'undefined') { color = "#000"; }
            
            self.settings.elements.log.append("<div style='color:"+color+"'><strong>"+self.getTime()+": </strong>"+text+"</div>");
            
        }
        ,clearLog:function () {
            var self = this;
            self.settings.elements.log.html("");
        }
        ,getTime: function () {
            var time = new Date();
            
            var hour = time.getHours()+"";
            var mins = time.getMinutes()+"";
            var secs = time.getSeconds()+"";
            
            hour = (hour.length==1?"0"+hour:hour);
            mins = (mins.length==1?"0"+mins:mins);
            secs = (secs.length==1?"0"+secs:secs);
            
            return hour+":"+mins+":"+secs;
        }
    }
    
    /* Load The game */
    var game = new Game();