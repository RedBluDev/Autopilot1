//function definitions
const debug = (a, b) => {if(b == undefined){console.log(a); return a} else {console.log(a), console.log(b); return b}};

const rng = (a, b) => b == undefined ? a : Math.floor(Math.random() * (Math.abs(a - b) + 1)) + Math.min(a, b);

const fys = a => {
    let b = [...a];
    for(let l = b.length - 1; l > 0; l--){
        let r = rng(0, l);
        [b[l], b[r]] = [b[r], b[l]]
    };
    return b
};

const wait = t => new Promise(res => setTimeout(res, t));

const logic = input => {
    const elements = [input];
    const and = [];
    const or = [];
    let value;
    do{
        while(true){
            let e = elements[elements.length - 1];
            if(Array.isArray(e)){
                if(e[0] == "and"){
                    and.push(1);
                    elements.push(e[1])
                } else {
                    or.push(1);
                    elements.push(e[1])
                }
            } else {
                if(e.not != undefined){
                    elements.push(e.not)
                } else {
                    value = (e.arg != undefined && args.includes(e.arg)) ||
                    (e.node != undefined && nodes[e.node][e.p] == (e.v ?? true)) ||
                    (entities[e.ent][e.p] == (e.v ?? true));
                    break
                }
            }
        };
        while(true){
            let p = elements[elements.length - 2];
            if(p == undefined) break;
            if(Array.isArray(p)){
                if(e[0] == "and"){
                    if(!value || p[and[and.length - 1] + 1] == undefined){
                        elements.pop();
                        and.pop()
                    } else {
                        and[and.length - 1]++;
                        elements[elements.length - 1] = p[and[and.length - 1]];
                        break
                    }
                } else {
                    if(value || p[or[or.length - 1] + 1] == undefined){
                        elements.pop();
                        or.pop()
                    } else {
                        or[or.length - 1]++;
                        elements[elements.length - 1] = p[or[or.length - 1]];
                        break
                    }
                }
            } else {
                value = !value;
                elements.pop()
            }
        }
    } while(elements[1] != undefined);
    return value
}

const call = async input => {
    console.log(input);
    const elements = [input];
    const path = [];
    const loops = [];
    do{
        while(true){
            let e = elements[elements.length - 1];
            if(Array.isArray(e)){
                if(e.length != 0){
                    path.push(0);
                    elements.push(e[0])
                } else break
            } else if(e.loop != undefined){
                loops.push(rng(...e.repeat));
                elements.push(e.loop)
            } else if(e.random != undefined){
                let n = rng(1, e.random.reduce((a, v) => a + v.chance, 0));
                let c = 0;
                elements.push(e.random.find(o => {c += o.chance; return n <= c}).element)
            } else {
                if(e.wait != undefined){
                    await wait(rng(...e.wait))
                } else if(e.f1 != undefined){
                    if(e.c == undefined || logic(e.c)){
                        if(e.f1 != undefined){
                            if(e.s1){await call(typeof e.f1 == "string" ? funcData[debug(e.f1)] : e.f1)
                            } else call(typeof e.f1 == "string" ? funcData[debug(e.f1)] : e.f1)
                        }
                    } else {
                        if(e.f2 != undefined){
                            if(e.s2){await call(typeof e.f2 == "string" ? funcData[debug(e.f2)] : e.f2)
                            } else call(typeof e.f2 == "string" ? funcData[debug(e.f2)] : e.f2)
                        }
                    }
                } else {
                    updateEnt(e.entities ?? {});
                    updateNode(e.nodes ?? {})
                };
                break
            }
        };
        while(true){
            let p = elements[elements.length - 2];
            if(p == undefined) break;
            if(Array.isArray(p)){
                if(p[path[path.length - 1] + 1] == undefined){
                    elements.pop();
                    path.pop()
                } else {
                    path[path.length - 1]++;
                    elements[elements.length - 1] = p[path[path.length - 1]];
                    break
                }
            } else if(p.loop != undefined){
                loops[loops.length - 1]--;
                if(loops[loops.length - 1] == 0){
                    elements.pop();
                    loops.pop()
                } else break
            } else elements.pop();
        }
    } while(elements[1] != undefined)
};

const create = (...ids) => ids.forEach(id => {
    let node = nodes[id];
    let element = document.createElement(({i: "IMG", t: "PRE", b: "DIV"})[node.t]);
    if(node.t == 'b') element.addEventListener("click", e => call(funcData[debug(nodes[e.currentTarget.id][entities.player.fn])]));
    element.id = id;
    document.getElementsByClassName("Autopilot")[0].append(element);
    updateNode((() => {let o = {}; o[id] = node; return o})())
});

const destroy = (...ids) => ids.forEach(id => document.getElementById(id).remove());

const updateNode = obj => Object.keys(obj).forEach(k => {
    let update = obj[k];
    nodes[k] = {...nodes[k], ...obj[k]};
    let node = nodes[k];
    let element = document.getElementById(k);
    if(element == null) return;
    let fns = {
        'x': v => element.style.left = "calc(50dvw + " + (v * 100) + "dvh)",
        'y': v => element.style.top = "calc(50dvh + " + (v * -100) + "dvh)",
        'z': v => element.style.zIndex = "" + v,
        'w': v => element.style.width = v * 100 + "dvh",
        'h': v => element.style.height = v * 100 + "dvh",
        'o': v => {if(node.t != 'b') element.style.opacity = "" + v},
        's': v => {if(node.t == 'i'){
            element.src = v
        } else if(node.t == 't'){
            element.style.fontFamily = v
        }},
        'f': v => {if(node.t == 't') element.style.fontSize = v * 100 + "dvh"},
        'c': v => {if(node.t == 't') element.style.color = v},
        'l': v => {if(node.t == 't') element.textContent = v},
        'r': v => element.style.rotate = v + "turn",
        sx: v => element.style.setProperty("--skewX", v + "turn"),
        sy: v => element.style.setProperty("--skewY", v + "turn")
    };
    if(update[entities.player.ch] != undefined){if(update[entities.player.ch]){
        element.classList.remove("hidden")
    } else {
        element.classList.add("hidden")
    }};
    let f;
    let c = Object.keys(update).length;
    for(f in fns){
        if(c == 0) break;
        if(update[f] != undefined){
            fns[f](node[f]);
            c--
        }
    }
});

const updateEnt = obj => {Object.keys(obj).forEach(k => {
    let update = obj[k];
    entities[k] = {...entities[k], ...obj[k]};
    let ent = entities[k];
    let fns = {
        in: v => {
            Object.keys(entities).forEach(({
                'r': l => {if(entities[l].in == v){
                    if(entities[l].side == 'g'){
                        call(funcData[debug(entities[l].df)])
                    } else if(entities[l].side == 'b' || entities[l].side == 'k'){
                        call(funcData[debug(ent.df)])
                    }
                }},
                'g': l => {if(entities[l].in == v){
                    if(entities[l].side == 'b'){
                        call(funcData[debug(entities[l].df)])
                    } else if(entities[l].side == 'r' || entities[l].side == 'k'){
                        call(funcData[debug(ent.df)])
                    }
                }},
                'b': l => {if(entities[l].in == v){
                    if(entities[l].side == 'r'){
                        call(funcData[debug(entities[l].df)])
                    } else if(entities[l].side == 'g' || entities[l].side == 'k'){
                        call(funcData[debug(ent.df)])
                    }
                }},
                'k': l => {if(entities[l].in == v){
                    if(entities[l].side == 'k'){
                        call(funcData[debug(entities[l].df)]);
                        call(funcData[debug(ent.df)]);
                    } else if(entities[l].side != 'w'){
                        call(funcData[debug(entities[l].df)]);
                    }
                }}, 'w': () => {}
            })[ent.side]);
            if(k == "player"){
                destroy(...Array.from(document.getElementsByClassName("Autopilot")[0].children).map(e => e.id).filter(id => nodes[id].t == 'b' && !roomData[v].includes(id)));
                create(...roomData[v].filter(n => nodes[n].t == 'b' && !document.getElementById(n)))
            }
        },
        at: v => {if(k == "player"){
            destroy(...Array.from(document.getElementsByClassName("Autopilot")[0].children).map(e => e.id).filter(id => nodes[id].t != 'b' && !roomData[v].includes(id)));
            create(...roomData[v].filter(n => nodes[n].t != 'b' && !document.getElementById(n)))
        }}
    };
    let f;
    let c = Object.keys(update).length;
    for(f in fns){
        if(c == 0) break;
        if(update[f] != undefined) fns[f](ent[f]);
        c--
    }
})};


//variable definitions
let args;
let nodes;
let entities;


//data definitions
let gameData;
let roomData;
let nodeData;
let funcData;


//initialization
(async () => {
    let data = [];
    let promises = ["gameData", "roomData", "nodeData", "funcData"].map(async (f, i) => data[i] = (await (await fetch("data/" + f + ".json")).json()));
    await Promise.all(promises);
    [gameData, roomData, nodeData, funcData] = data;
    nodes = structuredClone(nodeData);
    entities = structuredClone(gameData);
    document.getElementsByTagName("BUTTON")[0].addEventListener("click", () => {
        args = document.getElementsByTagName("INPUT")[0].value.split(' ');
        document.getElementsByClassName("menu")[0].classList.add("hidden");
        document.getElementsByClassName("Autopilot")[0].classList.remove("hidden");
        document.getElementsByTagName("INPUT")[0].classList.add("hidden");
        document.getElementsByClassName("end")[0].classList.remove("hidden");
        call(funcData[debug("start")]);
        updateEnt(entities);
        for(let k in entities){(async () => {
            if(entities[k].min == undefined) return;
            while(true){
                await wait(rng(entities[k].min, entities[k].max));
                let ent = entities[k];
                let b = roomData[ent.in].filter(n => nodes[n].t == 'b' && nodes[n][ent.ch]);
                let n = rng(1, b.reduce((a, v) => a + nodes[v][ent.ch], 0));
                let c = 0;
                call(funcData[debug(nodes[b.find(m => {c += nodes[m][ent.ch]; return n <= c})][ent.fn])])
            }
        })()}
    })
})()