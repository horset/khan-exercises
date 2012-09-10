// Example usage:
// <var>person(1)</var> traveled 5 mi by <var>vehicle(1)</var>. Let
// <var>his(1)</var> average speed be <var>personVar(1)</var>.
// Let <var>person(2)</var>'s speed be <var>personVar(2)</var>.
//
// Note that initials (-Var) are guaranteed to be unique in each category,
// but not across them.

$.extend(KhanUtil, {
    toSentence: function(array, conjunction) {
        if (conjunction == null) {
            conjunction = "和";
        }

        if (array.length === 0) {
            return "";
        } else if (array.length === 1) {
            return array[0];
        } else if (array.length === 2) {
            return array[0] + " " + conjunction + " " + array[1];
        } else {
            return array.slice(0, -1).join(", ") + ", " + conjunction + " " + array[array.length - 1];
        }
    },

    toSentenceTex: function(array, conjunction, highlight, highlightClass) {
        var wrapped = $.map(array, function(elem) {
            if (($.isFunction(highlight) && highlight(elem)) || (highlight !== undefined && elem === highlight)) {
                return "<code class='" + highlightClass + "'>" + elem + "</code>";
            }
            return "<code>" + elem + "</code>";
        });
        return KhanUtil.toSentence(wrapped, conjunction);
    },

    capitalize: function(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },

    // pluralization helper.  There are five signatures
    // - plural(NUMBER): return "s" if NUMBER is not 1
    // - plural(NUMBER, singular):
    //        - if necessary, magically pluralize <singular>
    //        - return "NUMBER word"
    // - plural(NUMBER, singular, plural):
    //        - return "NUMBER word"
    // - plural(singular, NUMBER):
    //        - if necessary, magically pluralize <singular>
    //        - return "word"
    // - plural(singular, plural, NUMBER):
    //        - return "word"
    plural: (function() {
        var oneOffs = {
            "quiz測驗": "quizzes測驗", //（sjf：可以翻成“小考”）
            "shelf架子": "shelves架子", //（sjf：“書架”）
            "loaf麵包": "loaves麵包",
            "potato馬鈴薯": "potatoes馬鈴薯",
            "person人": "people人",
            "is是": "are是",
            "was是": "were是",
            "foot腳": "feet腳", //（可以有兩個意思：腳、英尺。不知道實際上用哪一個？）
            "square foot平方公尺": "square feet平方公尺",
            "tomato番茄": "tomatoes番茄"
        };

        var pluralizeWord = function(word) {

            // noone really needs extra spaces at the edges, do they?
            word = $.trim(word);

            // determine if our word is all caps.  If so, we'll need to
            // re-capitalize at the end
            var isUpperCase = (word.toUpperCase() === word);
            var oneOff = oneOffs[word.toLowerCase()];
            var words = word.split(/\s+/);

            // first handle simple one-offs
            // ({}).watch is a function in Firefox, blargh
            if (typeof oneOff === "string") {
                return oneOff;
            }

            // multiple words
            else if (words.length > 1) {
                // for 3-word phrases where the middle word is 'in' or 'of',
                // pluralize the first word
                if (words.length === 3 && /\b(in|of)\b/i.test(words[1])) {
                    words[0] = KhanUtil.plural(words[0]);
                }

                // otherwise, just pluraize the last word
                else {
                    words[words.length - 1] =
                        KhanUtil.plural(words[words.length - 1]);
                }

                return words.join(" ");
            }

            // single words
            else {
                // "-y" => "-ies"
                if (/[^aeiou]y$/i.test(word)) {
                    word = word.replace(/y$/i, ""); //"ies"
                }

                // add "es"; things like "fish" => "fishes"
                else if (/[sxz]$/i.test(word) || /[bcfhjlmnqsvwxyz]h$/.test(word)) {
                    word += ""; //"es"
                }

                // all the rest, just add "s"
                else {
                    word += ""; //"s"
                }

                if (isUpperCase) {
                    word = word.toUpperCase();
                }
                return word;
            }
        };

        return function(value, arg1, arg2) {
            if (typeof value === "number") {
                var usePlural = (value !== 1);

                // if no extra args, just add "s" (if plural)
                if (arguments.length === 1) {
                    return usePlural ? "" : ""; //"s" : ""
                }

                if (usePlural) {
                    arg1 = arg2 || pluralizeWord(arg1);
                }

                return value + " " + arg1;
            } else if (typeof value === "string") {
                var plural = pluralizeWord(value);
                if (typeof arg1 === "string" && arguments.length === 3) {
                    plural = arg1;
                    arg1 = arg2;
                }
                var usePlural = (arguments.length < 2 || (typeof arg1 === "number" && arg1 !== 1));
                return usePlural ? plural : value;
            }
        };
    })()
});

$.fn["word-problemsLoad"] = function() {

    var IncrementalShuffler = function(array) {
        // Shuffle an array incrementally so we only use as many random calls
        // as we need, so names can be added/removed without breaking all
        // random seeds for all word problems
        // - get(0); get(0); will use only one call
        // - get(0); get(1); will have each use one random call
        // - get(1); get(0); will use two random calls then none and each call
        //   will give the same result as running 0 then 1
        array = [].slice.call(array, 0);
        var shuffled = 0;

        this.get = function(i) {
            if (i < 0 || i >= array.length) {
                return undefined;
            }

            while (shuffled <= i) {
                var top = array.length - shuffled,
                    newEnd = Math.floor(KhanUtil.random() * top),
                    tmp = array[newEnd];

                array[newEnd] = array[top - 1];
                array[top - 1] = tmp;
                shuffled++;
            }

            // Since we shuffle items from the end to the front, return the
            // items in reverse order
            return array[array.length - i - 1];
        };
    };

    var names = [
        ["小英", "f"],
        ["小明", "m"],
        ["學諒", "m"],
        ["新舟", "m"],
        ["偉誠", "m"],
        ["凱辰", "f"],
        ["芹萱", "f"],
        ["子恩", "m"],
        ["一寧", "f"],
        ["季玄", "m"],
        ["宗宇", "m"],
        ["皓瑋", "m"],
        ["子儀", "f"],
        ["翔中", "m"],
        ["沂玲", "f"],
        ["怡婷", "f"],
        ["巧筠", "f"],
        ["鎔毓", "f"], //（有些名字太難，建議找一些較普遍的名字）
        ["柏清", "m"]
    ];

    // We only want one name per letter of the alphabet, so group people with
    // the same initial before shuffling the names up
    var people = _.map(_.groupBy(names, function(name) {
        return name[0].charAt(0);
    }), function(group) {
        return new IncrementalShuffler(group);
    });
    people = new IncrementalShuffler(people);

    var vehicles = new IncrementalShuffler([
        "腳踏車",
        "汽車",
        "馬",
        "機車",
        "火車"
    ]);

    var courses = new IncrementalShuffler([
        "代數",
        "化學",
        "幾何學",
        "歷史",
        "物理",
        "英文"
    ]);

    var exams = new IncrementalShuffler([
        "考試", //（期末考）
        "考試", //（月考）
        "測驗" //（小考）
    ]);

    var binops = new IncrementalShuffler([
        "\\barwedge",
        "\\veebar",
        "\\odot",
        "\\oplus",
        "\\otimes",
        "\\oslash",
        "\\circledcirc",
        "\\boxdot",
        "\\bigtriangleup",
        "\\bigtriangledown",
        "\\dagger",
        "\\diamond",
        "\\star",
        "\\triangleleft",
        "\\triangleright"
    ]);

    var collections = new IncrementalShuffler([
        ["椅子", "排", "make做"], //（Make很多意思，不曉得在英文裡怎麼用？）
        ["party favor派對", "bag包", "fill裝滿"],
        ["軟糖", "堆", "make做"],
        ["書", "書架", "fill裝滿"],
        ["餅乾", "盒", "fill裝滿"]
    ]);

    var stores = new IncrementalShuffler([
        {
            name: "文具",
            items: new IncrementalShuffler(["原子筆", "鉛筆", "筆記本"])
        },
        {
            name: "五金",
            items: new IncrementalShuffler(["鐵鎚", "釘子", "鋸子"])
        },
        {
            name: "食品",
            items: new IncrementalShuffler(["香蕉", "loaf of bread麵包", "gallon of milk牛奶", "馬鈴薯"]) //（一條麵包，一加侖牛奶？）
        },
        {
            name: "禮品",
            items: new IncrementalShuffler(["玩具", "遊戲", "紀念品"])
        },
        {
            name: "玩具",
            items: new IncrementalShuffler(["泰迪熊", "電動玩具", "賽車", "洋娃娃"])
        }
    ]);

    var pizzas = new IncrementalShuffler([
        "比薩",
        "派",
        "蛋糕"
    ]);

    var timesofday = new IncrementalShuffler([
        "上午",
        "中午",
        "傍晚",
        "晚上"
    ]);

    var exercises = new IncrementalShuffler([
        "伏地挺身",
        "仰臥起坐",
        "交互蹲跳",
    ]);

    var fruits = new IncrementalShuffler([
        "蘋果",
        "梨子",
        "椰子",
        "茄子",
        "奇異果",
        "檸檬",
        "芒果",
        "桃子",
        "橘子",
        "芭樂",
        "西瓜"
    ]);

    var deskItems = new IncrementalShuffler([
        "夾子",
        "蠟筆",
        "橡皮擦",
        "資料夾",
        "膠水",
        "簽字筆",
        "筆記本",
        "鉛筆",
        "印章"
    ]);

    var colors = new IncrementalShuffler([
        "紅色",
        "橘色",
        "黃色",
        "綠色",
        "藍色",
        "紫色",
        "白色",
        "黑色",
        "褐色",
        "銀色",
        "金色",
        "粉紅色"
    ]);

    var schools = new IncrementalShuffler([
        "秀山國小",
        "秀朗國小",
        "中和國小",
        "均一國小",
        "永和國小",
        "興南國小",
        "板橋國小" //（請用桃源國小代替）
    ]);

    var furnitureStore = new IncrementalShuffler([
        "椅子",
        "茶几",
        "床",
        "沙發",
        "躺椅",
        "書桌",
        "書架"
    ]);

    var electronicStore = new IncrementalShuffler([
        "液晶電視", //（可以簡化些：電視、電腦、筆電、相機）
        "桌上型電腦",
        "筆記型電腦",
        "數位相機"
    ]);

    var clothes = new IncrementalShuffler([
        "帽子",
        "褲子",
        "皮帶",
        "項鍊",
        "皮包",
        "鞋子",
        "襯衫",
        "裙子",
        "手錶",
        "襪子",
        "毛衣",
        "領帶",
        "洋裝"
    ]);

    var sides = new IncrementalShuffler([
        "左",
        "右"
    ]);

    var shirtStyles = new IncrementalShuffler([
        "長袖",
        "短袖"
    ]);

    // animal, avg-lifespan, stddev-lifespan
    // (data is from cursory google searches and wild guessing)
    var animals = new IncrementalShuffler([
        ["鱷魚", 68, 20],
        ["食蟻獸", 15, 10],
        ["熊", 40, 20],
        ["大象", 60, 10],
        ["大猩猩", 20, 5],
        ["獅子", 12, 5],
        ["蜥蜴", 3, 1],
        ["羚羊", 13, 5],
        ["豪豬", 20, 5], //（山豬）
        ["海豹", 15, 10],
        ["猴子", 16, 5],
        ["蛇", 25, 10],
        ["老虎", 22, 5],
        ["烏龜", 100, 20],
        ["斑馬", 25, 10]
    ]);

    var farmers = new IncrementalShuffler([
        {farmer: "農夫", crops: new IncrementalShuffler(["番茄", "馬鈴薯", "胡蘿蔔", "豆子", "稻子"]), field: "農地"},
        {farmer: "園丁", crops: new IncrementalShuffler(["玫瑰花", "鬱金香", "菊花", "向日葵", "百合花"]), field: "花園"}
    ]);

    var distances = new IncrementalShuffler([
        "英里",
        "公里"
    ]);

    var distanceActivities = new IncrementalShuffler([
        {present: "騎", past: "騎", noun: "腳踏車", done: "騎", continuous: "騎"}, //（這幾個都很難翻。騎過、正在騎？怪怪的）
        {present: "划", past: "划", noun: "船", done: "划", continuous: "划"},
        {present: "開", past: "開", noun: "汽車", done: "開", continuous: "開"},
        {present: "遛", past: "遛", noun: "狗", done: "遛", continuous: "遛"}
    ]);

    var indefiniteArticle = function(word) {
        var vowels = ["a", "e", "i", "o", "u"];
        if (_(vowels).indexOf(word[0].toLowerCase()) > -1) {
            return "An " + word;
        }
        return "A " + word;
    };

    $.extend(KhanUtil, {
        person: function(i) {
            return people.get(i - 1).get(0)[0];
        },

        personVar: function(i) {
            return people.get(i - 1).get(0)[0].charAt(0).toLowerCase();
        },

        he: function(i) {
            return people.get(i - 1).get(0)[1] === "m" ? "他" : "她";
        },

        He: function(i) {
            return people.get(i - 1).get(0)[1] === "m" ? "他" : "她";
        },

        him: function(i) {
            return people.get(i - 1).get(0)[1] === "m" ? "他" : "她";
        },

        his: function(i) {
            return people.get(i - 1).get(0)[1] === "m" ? "他的" : "她的"; //（him、her似乎還是翻成他、她）
        },

        His: function(i) {
            return people.get(i - 1).get(0)[1] === "m" ? "他的" : "她的";
        },

        An: function(word) {
            return indefiniteArticle(word);
        },

        an: function(word) {
            return indefiniteArticle(word).toLowerCase();
        },

        vehicle: function(i) {
            return vehicles.get(i - 1);
        },

        vehicleVar: function(i) {
            return vehicles.get(i - 1).charAt(0);
        },

        course: function(i) {
            return courses.get(i - 1);
        },

        courseVar: function(i) {
            return courses.get(i - 1).charAt(0).toLowerCase();
        },

        exam: function(i) {
            return exams.get(i - 1);
        },

        binop: function(i) {
            return binops.get(i - 1);
        },

        item: function(i) {
            return collections.get(i - 1)[0];
        },

        group: function(i) {
            return collections.get(i - 1)[1];
        },

        groupVerb: function(i) {
            return collections.get(i - 1)[2];
        },

        store: function(i) {
            return stores.get(i).name;
        },

        storeItem: function(i, j) {
            return stores.get(i).items.get(j);
        },

        pizza: function(i) {
            return pizzas.get(i);
        },

        exercise: function(i) {
            return exercises.get(i - 1);
        },

        timeofday: function(i) {
            return timesofday.get(i - 1);
        },

        school: function(i) {
            return schools.get(i - 1);
        },

        clothing: function(i) {
            return clothes.get(i - 1);
        },

        color: function(i) {
            return colors.get(i - 1);
        },

        fruit: function(i) {
            return fruits.get(i);
        },

        deskItem: function(i) {
            return deskItems.get(i);
        },

        distance: function(i) {
            return distances.get(i - 1);
        },

        rode: function(i) {
            return distanceActivities.get(i - 1).past;
        },

        ride: function(i) {
            return distanceActivities.get(i - 1).present;
        },

        bike: function(i) {
            return distanceActivities.get(i - 1).noun;
        },

        biked: function(i) {
            return distanceActivities.get(i - 1).done;
        },

        biking: function(i) {
            return distanceActivities.get(i - 1).continuous;
        },

        farmer: function(i) {
            return farmers.get(i - 1).farmer;
        },

        crop: function(i) {
            return farmers.get(i - 1).crops.get(0);
        },

        field: function(i) {
            return farmers.get(i - 1).field;
        },

        side: function(i) {
            return sides.get(i - 1);
        },

        shirtStyle: function(i) {
            return shirtStyles.get(i - 1);
        },

        furniture: function(i) {
            return furnitureStore.get(i - 1);
        },

        electronic: function(i) {
            return electronicStore.get(i - 1);
        },

        animal: function(i) {
            return animals.get(i - 1)[0];
        },

        animalAvgLifespan: function(i) {
            return animals.get(i - 1)[1];
        },

        animalStddevLifespan: function(i) {
            return animals.get(i - 1)[2];
        }
    });
};
