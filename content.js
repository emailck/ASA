
function addReport(param) {
    if (param.readyState != 4 || param.status != 200) {
        return;
    }
    var offset = param.responseText.indexOf("<small>(", 1000);
    if (offset < 0) {
        return;
    }
    var offset2 = param.responseText.indexOf("</small>", offset);
    var str = param.responseText.substring(offset, offset2);
	var strs = param.responseText.substring(offset, offset2).split(';');
	strs[0].replace(/.*: /, "");
	strs[1].replace(/.*:/, "");
    var report = document.createElement('p');
    report.innerHTML = strs[0].replace(/.*: /, "") + strs[1].replace(/.*:/, "vs").replace(/ .$/, "");
    report.style.color = "#FF0000";
    report.setAttribute("class", "myreport");
    var div = document.getElementById("base_div");
    var reports = div.getElementsByClassName("myreport");
    if (!reports || reports.length <= 0) {
        div.appendChild(report);
    } else {
        div.insertBefore(report, reports[0]);
    }
}

function postAsync(url2get, sendstr, sync, referer, callback) {
    var req = new XMLHttpRequest();
    req.open("POST", url2get, sync);
    req.setRequestHeader("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8");
    req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	if (referer && referer.length > 0) {
		req.setRequestHeader("replace_referer", referer);
	}
	if (sync) {
        req.onreadystatechange = f => {callback(req);};
    }
    req.send(sendstr);
    if (req.readyState == 4 && req.status == 200) {
        return req.responseText;
    }
}

function attack(btn, times) {
    var res_str = postAsync(btn.parentElement.action, "form=true", false);
    if (!res_str) {
        return;
    }
    var div = document.createElement('div');
    document.body.appendChild(div);
    div.innerHTML = res_str;
    div.style.display = "none";
    var btns = div.getElementsByClassName("input-button input-button-important");
    if (!btns || btns.length <= 0) {
        return;
    }
    var form = btns[0].parentNode;
    var post_data = [];
    for (var i = 0; i < form.childNodes.length; ++i) {
        var node = form.childNodes[i];
        if (node.type != 'hidden') {
            continue;
        }
        post_data.push(node.name + '=' + node.value);
    }
    if (post_data.length == 0) {
        return;
    }
    var url = new URL(btn.parentElement.action);
    var referer = url.protocol + "//" + url.host + "/fleet.aspx?fleet=" + url.searchParams.get("fleet");
    var repair_href = url.protocol + "//" + url.host + "/fleet.aspx?fleet=" + url.searchParams.get("fleet") + "&ch=1&action=repair&unit=all";
    for (i = 0; i < times; ++i) {
        postAsync(form.action.toString(), post_data.join('&'), true, form.action.toString(), addReport);
        var req = new XMLHttpRequest();
        req.open("GET", repair_href, true);
        req.setRequestHeader("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8");
        req.setRequestHeader("replace_referer", referer);
        req.send();
    }
}

function selectFleet(ids) {
    var atk_div = document.getElementById("fleets_attack-list");
    if (!atk_div) {
        return;
    }
    var all_btns = atk_div.getElementsByClassName('input-button');
    var btns = [];
    for (var i = 0; i < all_btns.length; i++) {
        var value = all_btns[i].getAttribute("value");
        if (value == "Attack Fleet" || value == "攻击舰队") {
            btns.push(all_btns[i]);
        }
    }
    if (btns.length == 0) {
        return;
    }
    var body = btns[0].parentNode.parentNode.parentNode.parentNode;
    var trs =[];
    for (i = 0 ; i < btns.length; ++i) {
        trs.push(btns[i].parentNode.parentNode.parentNode);
    }
    for (i = 0; i < trs.length; ++i) {
        if (trs[i].childNodes.length != 4) {
            continue;
        }
        var tags = trs[i].childNodes[1].getElementsByTagName('a');
        var url = new URL(tags[0].href);
        var player_id = url.searchParams.get("player");
        var flag = ids.length == 0;
        for (var j = 0; j < ids.length; ++j) {
            if (ids[j] == player_id) {
                flag = true;
                break;
            }
        }
        if (!flag) {
            body.removeChild(trs[i]);
        } else {
            var btn3 = document.createElement("input");
            btn3.setAttribute("type", "button");
            btn3.setAttribute("class", "input-button input-button-important");
            btn3.setAttribute("value", "突突突");
            btn3.addEventListener("click", function(){attack(this, 5);}, false);
            btns[i].parentNode.appendChild(btn3);
        }
    }
}

function checkForm(event) {
    var table = document.getElementById("ids-table");
    var id = document.getElementById("ids-form-input").value;
    event.preventDefault();
    if (id.length == 0) {
        return;
    }
    document.getElementById("ids-form-input").value = "";
    addRow(table, id);
    saveIds(table);
}

function saveIds(table) {
    var tds = table.getElementsByClassName("ids-row");
    var ids = [];
    for (var i = 0; i < tds.length; i++) {
        ids.push(tds[i].getAttribute("value"));
    }
    localStorage.setItem("ids", ids.length == 0 ? '' : ids.join(','));
}

function delRow(row) {
    var table = row.parentNode.parentNode;
    table.firstChild.removeChild(row);
    saveIds(table);
}

function addRow(table, id) {
    var row = table.insertRow();
    row.setAttribute("value", id);
    row.setAttribute("class", "ids-row");
    var cell1 = row.insertCell();
    cell1.innerHTML = id;
    cell1.style.width = "70px";
    var cell2 = row.insertCell();
    cell2.setAttribute("type", 'a');
    cell2.innerHTML = "删除";
    cell2.setAttribute("class", "btn-normal");
    cell2.style.cursor = "pointer";
	cell2.style.textAlign = "center";
    cell2.addEventListener("click", function(){delRow(this.parentNode);}, false);
}

function initUI(ids) {
    var div = document.createElement("div");
    div.setAttribute("id", "base_div");
    div.style.zIndex= "9999";
    var span = document.createElement("span");
    span.setAttribute("class", "galaxy");
    span.style.cursor = "default";
    span.setAttribute("title", "在攻击页面只显示指定玩家的舰队");
    span.innerHTML = "攻击助手";
    div.appendChild(span);
    var form = document.createElement("form");
    form.setAttribute("id", "ids-form");
    form.style.width = "100%";

    var input0 = document.createElement("input");
    input0.setAttribute("type", "text");
    input0.setAttribute("id", "fleet-form-input");
    input0.setAttribute("class", "input-text");
    input0.setAttribute("title", "你的舰队ID");
    input0.setAttribute("onkeyup", "this.value=this.value.replace(/\\D/g,'');localStorage.setItem('my_fleet', this.value);");
    input0.style.width = "60px";
    if (localStorage.getItem('my_fleet')) {
        input0.value = localStorage.getItem('my_fleet');
    }
    form.appendChild(input0);
    var btn0 = document.createElement("input");
    btn0.setAttribute("type", "button");
    btn0.setAttribute("value", "攻击");
    btn0.setAttribute("class", "input-button");
	if (document.URL.toString().search("fleet") < 0) {
		btn0.disabled = true;
	}
    btn0.setAttribute("onclick", "var id = document.getElementById('fleet-form-input').value; if (id.length > 0) window.location.href = 'fleet.aspx?fleet=' + id + '&view=attack'");   
	form.appendChild(btn0);

    span = document.createElement("span");
    span.setAttribute("class", "galaxy");
    span.style.cursor = "default";
    span.innerHTML = "敌人ID列表";
    form.appendChild(span);

    var input = document.createElement("input");
    input.setAttribute("type", "text");
    input.setAttribute("id", "ids-form-input");
    input.setAttribute("class", "input-text");
    input.setAttribute("title", "玩家的数字ID");
    input.setAttribute("onkeyup", "this.value=this.value.replace(/\\D/g,'')");
    input.style.width = "60px";
    form.appendChild(input);
    var btn = document.createElement("input");
    btn.setAttribute("type", "submit");
    btn.setAttribute("value", "增加");
    btn.setAttribute("class", "input-button");
    form.appendChild(btn);
    //form.addEventListener("submit", checkForm(this), false);
    div.appendChild(form);
    var table = document.createElement("table");
    table.style.width = form.style.width;
    table.setAttribute("id","ids-table");
    table.setAttribute("class", "layout listing btnlisting tbllisting1 sorttable");
    for (var i = 0; i < ids.length; ++i) {
        addRow(table, ids[i]);
    }
    div.appendChild(table);

	var x = document.getElementById("background-content");
    if (x) {
		div.style.float = "right";
		div.style.position = "relative";
		div.setAttribute("class", "ui-draggable");
		div.style.width = "131px";
		div.style.display = "inline-block";
		div.style.zIndex= "9999";
		div.style.left = "150px";
		div.style.top = "-" + (x.clientHeight - 150)  + "px";
        x.append(div);
    } else {
		x = document.getElementsByClassName("top")[0];
		//div.style.position = "fixed";
		div.style.float = "left";
		div.style.position = "relative";
		div.style.width = "111px";
		div.style.display = "inline-block";
		div.style.left = (x.offsetLeft + 850) + "px";
		console.log(x.parentNode.nextSbiling);
        //document.body.insertBefore(div, x);
		document.body.appendChild(div);
		div.style.top = (-div.offsetTop + x.clientHeight + div.clientHeight) + "px";
		console.log(div.offsetTop);
    }
    form.addEventListener("submit", checkForm, false);
}

(function() {
    var ids_str = localStorage.getItem("ids");
    var ids = ids_str ? ids_str.split(',') : [];
    initUI(ids);
    selectFleet(ids);
    var ad = document.getElementById('advertising');
    if (ad) {
        ad.parentNode.removeChild(ad);
    }
})();