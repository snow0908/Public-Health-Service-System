
  /* ==========================================================================
   * 档案维护页逻辑
   * 流程：居民档案列表「新建 → 下一步」携带表单参数打开本页
   *   封面（图2）→ 下一步 → 个人基本信息表（图3/4）→ 保存 → 完整度100%（图5）
   * ========================================================================== */
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  /* 仅当下拉存在同名选项时才赋值，避免把 select 置空 */
  function setSelIf(id, val) {
    if (!val) return;
    var s = $(id);
    for (var i = 0; i < s.options.length; i++) {
      if (s.options[i].value === val) { s.value = val; return; }
    }
  }
  /* 下拉赋值：无同名选项时动态补充选项，保证已有档案的机构/医生可回显 */
  function setSelAdd(id, val) {
    if (!val) return;
    setSelIf(id, val);
    var s = $(id);
    if (s.value !== val) {
      var o = document.createElement('option');
      o.value = val;
      o.textContent = val;
      s.appendChild(o);
      s.value = val;
    }
  }

  /* ================= 入参（新建弹框提交的基本信息；直接打开时使用演示数据） ================= */
  var QS = new URLSearchParams(location.search);
  var P = {
    name:   QS.get('name')   || '张三',
    gender: QS.get('gender') || '女性',
    idcard: QS.get('idcard') || '510698198508071369',
    birth:  QS.get('birth')  || '1985-08-07',
    phone:  QS.get('phone')  || '17896788523',
    nation: QS.get('nation') || '汉族',
    region: QS.get('region') || '山东省济南市历下区',
    addr:   QS.get('addr')   || '解放路105号'
  };

  /* ================= 地址级联数据（省 → 市 → 区县 → 乡镇/街道 → 村/居社区，与设计稿下拉一致） ================= */
  var ADDR = {
    '内蒙古自治区': { '呼和浩特市': { '新城区': { '东风路街道': ['东库街社区', '丽苑社区'] } } },
    '辽宁省': { '沈阳市': { '和平区': { '太原街街道': ['环行社区', '中山社区'] } } },
    '吉林省': { '长春市': { '朝阳区': { '桂林路街道': ['同光路社区', '立信社区'] } } },
    '黑龙江省': { '哈尔滨市': { '道里区': { '抚顺街道': ['安祥社区', '地德里社区'] } } },
    '上海市': { '市辖区': { '浦东新区': { '陆家嘴街道': ['梅园社区', '仁恒社区'] } } },
    '江苏省': {
      '南京市': { '玄武区': { '梅园新村街道': ['大影壁社区', '明故宫社区'] } },
      '苏州市': { '姑苏区': { '平江街道': ['历史街区社区', '钮家巷社区'] } },
      '南通市': { '崇川区': { '和平桥街道': ['濠阳社区', '北濠桥社区'] } },
      '连云港市': { '海州区': { '新东街道': ['苍梧社区', '文昌社区'] } },
      '淮安市': { '清江浦区': { '长西街道': ['引河社区', '上海路社区'] } },
      '盐城市': { '亭湖区': { '文峰街道': ['朝阳社区', '大庆社区'] } },
      '扬州市': {
        '广陵区': { '东关街道': ['古旗亭社区', '彩衣街社区'] },
        '邗江区': { '汊河街道': ['许蒋社区', '胡庄社区'] },
        '江都区': {
          '仙女镇': ['北苑社区', '东苑社区', '砖桥社区'],
          '小纪镇': ['纪东社区', '宗村村'],
          '樊川镇': ['樊汊社区', '招贤社区', '东汇社区', '永安社区', '三周社区', '直属村'],
          '武坚镇': ['周西社区', '五尖村', '黄思村', '联全村'],
          '真武镇': ['真武社区', '滨湖村'],
          '宜陵镇': ['宜陵社区', '西湖村']
        },
        '宝应县': { '安宜镇': ['白田社区', '铁桥社区'] },
        '扬州经济技术开发区': { '扬子津街道': ['顺达社区', '新华社区'] },
        '仪征市': { '真州镇': ['嘉禾社区', '迎江社区'] }
      }
    },
    '山东省': {
      '济南市': {
        '历下区': { '解放路街道': ['解放桥社区', '历山路社区'], '文化东路街道': ['文东社区', '和平路社区'] },
        '市中区': { '杆石桥街道': ['乐山小区社区', '春元里社区'] }
      }
    }
  };

  var PH = '请选择';

  /* 级联选择器通用渲染：prefix 为 5 个 select 的 id 前缀，preset 为默认选中数组 */
  function fillOptions(sel, list, presetVal) {
    var html = '<option value="">' + PH + '</option>';
    list.forEach(function (v) { html += '<option value="' + esc(v) + '"' + (v === presetVal ? ' selected' : '') + '>' + esc(v) + '</option>'; });
    sel.innerHTML = html;
  }
  function subAddr(level, vals) {
    var d = ADDR;
    for (var i = 0; i < level && d; i++) d = d[vals[i]];
    return d || {};
  }
  /* 级联选项填充：prefix 为 5 个 select 的 id 前缀，vals 为各级选中值（可截断） */
  function setCascade(prefix, vals) {
    vals = vals || [];
    var sels = [1, 2, 3, 4, 5].map(function (i) { return $(prefix + i); });
    fillOptions(sels[0], Object.keys(ADDR), vals[0]);
    fillOptions(sels[1], vals[0] ? Object.keys(subAddr(1, vals)) : [], vals[1]);
    fillOptions(sels[2], vals[1] ? Object.keys(subAddr(2, vals)) : [], vals[2]);
    fillOptions(sels[3], vals[2] ? Object.keys(subAddr(3, vals)) : [], vals[3]);
    fillOptions(sels[4], vals[3] ? (subAddr(4, vals) || []) : [], vals[4]);
  }
  /* 级联初始化：填充选项 + 绑定一次 change（某级变化时重置其下级） */
  var boundPrefixes = {};
  function initCascade(prefix, preset) {
    setCascade(prefix, preset);
    if (boundPrefixes[prefix]) return;
    boundPrefixes[prefix] = true;
    var sels = [1, 2, 3, 4, 5].map(function (i) { return $(prefix + i); });
    sels.forEach(function (sel, idx) {
      sel.addEventListener('change', function () {
        var cur = sels.map(function (s) { return s.value; });
        for (var k = idx + 2; k <= 5; k++) {
          var opts = [];
          if (k === 2) opts = cur[0] ? Object.keys(subAddr(1, cur)) : [];
          if (k === 3) opts = cur[1] ? Object.keys(subAddr(2, cur)) : [];
          if (k === 4) opts = cur[2] ? Object.keys(subAddr(3, cur)) : [];
          if (k === 5) opts = cur[3] ? (subAddr(4, cur) || []) : [];
          fillOptions(sels[k - 1], opts, '');
        }
        if (prefix === 'cvP') syncTown();
      });
    });
  }

  /* 乡镇 / 村居委会：随封面现住址选择自动带出 */
  function syncTown() {
    var town = $('cvP4').value, village = $('cvP5').value;
    $('cvTown').value = town || '';
    $('cvVillage').value = village ? village + '居委会' : '';
  }

  /* ================= 封面级联地址选择器（单框展示 + 五列下拉面板，状态存于隐藏 select） ================= */
  var CASC_CHECK = '<span class="casc-check"><svg viewBox="0 0 12 12" width="12" height="12"><path d="M2 6.5l2.8 2.8L10 3.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span>';
  function initCascaderWidget(wrapId, prefix, maxLv) {
    maxLv = maxLv || 5;
    var wrap = $(wrapId);
    var box = wrap.querySelector('.cascader-box');
    var valEl = wrap.querySelector('.cascader-val');
    var panel = wrap.querySelector('.cascader-panel');
    var clear = wrap.querySelector('.cascader-clear');
    var sels = [];
    for (var si = 1; si <= maxLv; si++) sels.push($(prefix + si));
    var snapshot = null;

    function curVals() { return sels.map(function (s) { return s.value; }); }
    function optsAt(lv) {
      var cur = curVals();
      if (lv === 1) return Object.keys(ADDR);
      if (!cur[lv - 2]) return [];
      var d = subAddr(lv - 1, cur);
      return d ? (Array.isArray(d) ? d : Object.keys(d)) : [];
    }
    function renderBox() {
      var vals = curVals().filter(Boolean);
      valEl.textContent = vals.length ? vals.join(' / ') : PH;
      valEl.classList.toggle('ph', !vals.length);
      wrap.classList.toggle('has-val', vals.length > 0);
    }
    function renderPanel() {
      panel.innerHTML = '';
      for (var lv = 1; lv <= maxLv; lv++) {
        (function (lv) {
          var opts = optsAt(lv);
          if (!opts.length) return;
          var col = document.createElement('div');
          col.className = 'casc-col';
          opts.forEach(function (o) {
            var on = (sels[lv - 1].value === o);
            var item = document.createElement('div');
            item.className = 'casc-opt' + (on ? ' active' : '');
            item.innerHTML = '<span class="casc-txt">' + esc(o) + '</span>' + (on ? CASC_CHECK : '');
            item.addEventListener('click', function (e) {
              e.stopPropagation();
              if (sels[lv - 1].value === o) return;
              sels[lv - 1].value = o;
              sels[lv - 1].dispatchEvent(new Event('change', { bubbles: true }));
              if (lv < maxLv && optsAt(lv + 1).length) {
                renderPanel();
              } else {
                renderBox();
                close();
              }
            });
            col.appendChild(item);
          });
          panel.appendChild(col);
        })(lv);
      }
    }
    function open() { snapshot = curVals(); renderPanel(); wrap.classList.add('open'); }
    function close() { wrap.classList.remove('open'); }
    function abandon() {
      if (snapshot) {
        setCascade(prefix, snapshot);
        if (prefix === 'cvP') syncTown();
      }
      close();
    }

    box.addEventListener('click', function () {
      wrap.classList.contains('open') ? abandon() : open();
    });
    clear.addEventListener('click', function (e) {
      e.stopPropagation();
      sels.forEach(function (s) { s.value = ''; });
      sels[0].dispatchEvent(new Event('change', { bubbles: true }));
      snapshot = curVals();
      renderBox();
      renderPanel();
    });
    document.addEventListener('click', function (e) {
      if (wrap.classList.contains('open') && !wrap.contains(e.target)) abandon();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && wrap.classList.contains('open')) abandon();
    });
    cascaderRefresh[prefix] = renderBox;
    renderBox();
  }
  var cascaderRefresh = {};

  /* ================= 封面输入框字数统计（姓名 n/8、详细地址 n/50） ================= */
  function bindCnt(inputId, cntId) {
    var el = $(inputId), cnt = $(cntId);
    if (!el || !cnt) return;
    var max = el.maxLength || 0;
    function upd() { cnt.textContent = el.value.length + '/' + max; }
    el.addEventListener('input', upd);
    upd();
  }

  /* 参数 region（如"江苏省扬州市江都区樊川镇招贤社区"）→ 级联预设数组（最多五级） */
  function parseRegion(region) {
    var out = [];
    if (!region) return out;
    var prov = Object.keys(ADDR).filter(function (p) { return region.indexOf(p) === 0; })[0];
    if (!prov) return out;
    out.push(prov);
    var d = ADDR[prov];
    for (var lv = 2; lv <= 5; lv++) {
      if (!d) break;
      /* 第 5 级（村/居社区）为数组，其余各级为对象 */
      var hit = (Array.isArray(d) ? d : Object.keys(d)).filter(function (c) { return region.indexOf(c) > -1; })[0];
      if (!hit) break;
      out.push(hit);
      d = d[hit];
    }
    return out;
  }

  /* ================= 年龄 ================= */
  function calcAge(birth) {
    if (!birth) return '';
    var b = new Date(birth), n = new Date();
    if (isNaN(b.getTime())) return '';
    var age = n.getFullYear() - b.getFullYear();
    var m = n.getMonth() - b.getMonth();
    if (m < 0 || (m === 0 && n.getDate() < b.getDate())) age--;
    return age >= 0 ? age + '岁' : '';
  }
  function todayStr() {
    var n = new Date();
    return n.getFullYear() + '-' + String(n.getMonth() + 1).padStart(2, '0') + '-' + String(n.getDate()).padStart(2, '0');
  }

  /* ============ 随访分类自动判定（高血压/糖尿病随访表：按年龄段与阈值自动回填「此次随访分类」） ============
     阈值默认值与「表单维护 → 随访分类设置」保持一致，原型内直接以常量呈现配置结果 */
  var FU_FCX = {
    threshold: 65,
    htn: {
      elderly: { ok: { sbp: 140, dbp: 90 }, no: { sbp: 140, dbp: 90 } },
      young:   { ok: { sbp: 130, dbp: 80 }, no: { sbp: 130, dbp: 80 } }
    },
    dm: {
      elderly: { ok: { fbg: 8.3 }, no: { fbg: 8.3 } },
      young:   { ok: { fbg: 7.0 }, no: { fbg: 7.0 } }
    }
  };
  /* 0-6岁儿童档案不纳入慢病随访：不存在高血压随访表，无需处理 */
  function fuAge() {
    var a = parseInt(calcAge(QS.get('birth') || P.birth), 10);
    return isNaN(a) ? null : a;
  }
  function setRadioChecked(name, val) {
    var els = document.getElementsByName(name);
    for (var i = 0; i < els.length; i++) { if (els[i].value === val) { els[i].checked = true; return; } }
  }
  /* 高血压随访：收缩压/舒张压均满足「控制满意」阈值→控制满意；均满足「控制不满意」阈值→控制不满意；否则不干预手动选择 */
  function judgeHtnCategory() {
    var age = fuAge();
    if (age === null || !$('fuSbp') || !$('fuDbp')) return;
    var sen = age >= FU_FCX.threshold;
    var g = sen ? FU_FCX.htn.elderly : FU_FCX.htn.young;
    var sbp = parseFloat($('fuSbp').value), dbp = parseFloat($('fuDbp').value);
    if (isNaN(sbp) || isNaN(dbp)) return;
    if (sbp <= g.ok.sbp && dbp <= g.ok.dbp) setRadioChecked('fuCategory', '控制满意');
    else if (sbp > g.no.sbp && dbp > g.no.dbp) setRadioChecked('fuCategory', '控制不满意');
  }
  /* 糖尿病随访：空腹血糖满足「控制满意」阈值→控制满意；满足「控制不满意」阈值→控制不满意 */
  function judgeDmCategory() {
    var age = fuAge();
    if (age === null || !$('dmFuFbg')) return;
    var sen = age >= FU_FCX.threshold;
    var g = sen ? FU_FCX.dm.elderly : FU_FCX.dm.young;
    var fbg = parseFloat($('dmFuFbg').value);
    if (isNaN(fbg)) return;
    if (fbg < g.ok.fbg) setRadioChecked('dmFuCategory', '控制满意');
    else if (fbg >= g.no.fbg) setRadioChecked('dmFuCategory', '控制不满意');
  }

  /* ================= 家族史（父亲/母亲/兄弟姐妹/子女：每成员一行，仅复选框，无单选；勾「无」清其他，勾疾病清「无」；「其他」勾选联动说明输入框） ================= */
  var FAM_ROLES = ['父亲', '母亲', '兄弟姐妹', '子女'];
  var FAM_DIS = ['无', '高血压', '糖尿病', '冠心病', '慢性阻塞性肺疾病', '恶性肿瘤', '脑卒中', '严重精神障碍', '结核病', '肝炎', '先天畸形', '其他'];
  function buildFamTable() {
    var html = '';
    FAM_ROLES.forEach(function (role, ri) {
      html += '<div class="hp-row tall"><div class="hp-label"><i>*</i>' + role + '</div><div class="hp-field"><div class="opts">';
      FAM_DIS.forEach(function (d) {
        var on = d === '无';
        html += '<label class="chk"><input type="checkbox" data-fam="' + ri + '" value="' + d + '"' + (on ? ' checked' : '') + '>' + d + '</label>';
        if (d === '其他') {
          html += '<input class="ctl fam-other" data-fam="' + ri + '" maxlength="30" placeholder="请输入" style="width:150px" hidden>';
        }
      });
      html += '</div></div></div>';
    });
    $('famBody').innerHTML = html;
  }

  /* ================= 互斥复选组：勾「无」清其他，勾其他清「无」 ================= */
  function bindMutex(boxId, noneVal) {
    $(boxId).addEventListener('change', function (e) {
      var t = e.target;
      if (t.type !== 'checkbox') return;
      var boxes = $(boxId).querySelectorAll('input[type="checkbox"]');
      if (t.value === noneVal && t.checked) {
        boxes.forEach(function (b) { if (b !== t) b.checked = false; });
      } else if (t.value !== noneVal && t.checked) {
        boxes.forEach(function (b) { if (b.value === noneVal) b.checked = false; });
      }
    });
  }
  function bindFamMutex() {
    $('famBody').addEventListener('change', function (e) {
      var t = e.target;
      if (t.type !== 'checkbox' || t.getAttribute('data-fam') === null) return;
      var ri = t.getAttribute('data-fam');
      var boxes = $('famBody').querySelectorAll('input[type="checkbox"][data-fam="' + ri + '"]');
      var otherInput = $('famBody').querySelector('input.fam-other[data-fam="' + ri + '"]');
      /* 勾「无」清空其他勾选，勾疾病取消「无」 */
      if (t.value === '无' && t.checked) {
        boxes.forEach(function (b) { if (b !== t) b.checked = false; });
        if (otherInput) { otherInput.hidden = true; otherInput.value = ''; }
      } else if (t.value !== '无' && t.checked) {
        boxes.forEach(function (b) { if (b.value === '无') b.checked = false; });
      }
      /* 「其他」勾选联动说明输入框（display 切换，未选时不占高度） */
      if (t.value === '其他' && otherInput) {
        otherInput.hidden = !t.checked;
        if (!t.checked) otherInput.value = '';
      }
    });
  }

  /* ================= 个人健康凭证：动态增删行 ================= */
  var certSeq = 2;
  function addCertRow() {
    certSeq++;
    var tr = document.createElement('tr');
    tr.innerHTML =
      '<td><select class="ctl" id="cert' + certSeq + 'Name"><option value="">请选择</option><option>出生医学证明</option><option>预防接种证</option><option>其他健康凭证</option></select></td>' +
      '<td><input class="ctl" id="cert' + certSeq + 'No" maxlength="20" placeholder="请输入"></td>' +
      '<td><input class="ctl" id="cert' + certSeq + 'Org" maxlength="30" placeholder="请输入"></td>' +
      '<td><input class="ctl" id="cert' + certSeq + 'Date" type="date"></td>' +
      '<td><input class="ctl" id="cert' + certSeq + 'Exp" type="date"></td>' +
      '<td style="text-align:center"><span class="del-btn" onclick="delCertRow(this)">删除</span></td>';
    $('certBody').appendChild(tr);
  }
  function delCertRow(el) {
    el.closest('tr').remove();
    renderComplete();
  }

  /* ================= 既往史：手术/外伤/输血/预防接种史——「有」展开明细，动态增删行 ================= */
  function addPastRow(tblId) {
    var tr = document.createElement('tr');
    tr.innerHTML =
      '<td><input class="ctl" maxlength="30" placeholder="请输入"></td>' +
      '<td><input class="ctl" type="date"></td>' +
      '<td class="op-cell"><span class="op-btn op-add" onclick="addPastRow(\'' + tblId + '\')">＋</span><span class="op-btn op-del" onclick="delPastRow(this)">×</span></td>';
    $(tblId).querySelector('tbody').appendChild(tr);
  }
  function delPastRow(el) {
    el.closest('tr').remove();
  }
  function bindPastToggle() {
    ['surgery', 'trauma', 'transfusion', 'vaccine'].forEach(function (nm) {
      var tbl = $(nm + 'Tbl');
      document.querySelectorAll('input[name="' + nm + '"]').forEach(function (r) {
        r.addEventListener('change', function () {
          tbl.hidden = r.value !== '有';
          if (r.value === '有' && !tbl.querySelector('tbody tr')) addPastRow(nm + 'Tbl');
        });
      });
    });
  }

  /* ================= 顶部居民信息栏 ================= */
  function renderPatientBar() {
    $('ptName').textContent = $('biName').value || P.name;
    $('ptAge').textContent = calcAge($('biBirth').value || P.birth);
    $('ptIdcard').textContent = $('biIdcard').value || P.idcard;
    $('ptBirth').textContent = $('biBirth').value || P.birth;
    var abo = document.querySelector('input[name="abo"]:checked');
    $('ptBlood').textContent = abo ? abo.value : '-';
    var phone = $('biPhone').value || $('cvPhone').value || P.phone;
    $('ptPhone').textContent = phone || '-';
    var al = [];
    document.querySelectorAll('input[name="allergy"]:checked').forEach(function (c) { al.push(c.value); });
    $('ptAllergy').textContent = al.length ? al.join('、') : '-';
    var addrParts = [$('cvP1').value, $('cvP2').value, $('cvP3').value, $('cvP4').value, $('cvP5').value, $('cvAddrDetail').value];
    var addr = addrParts.filter(Boolean).join('');
    $('ptAddr').textContent = addr || (P.region + P.addr);
    $('ptAddr').title = $('ptAddr').textContent;
  }

  /* ================= 完整度：12 个关键分区，每区 ≈8.33%；保存后 100% ================= */
  var saved = false;
  function secDone(sec) {
    switch (sec) {
      case 'secCrowd':   return !!document.querySelector('[data-sec="secCrowd"] input:checked');
      case 'secHealth':  return !!document.querySelector('[data-sec="secHealth"] input:checked');
      case 'secBlood':   return !!document.querySelector('[data-sec="secBlood"] input:checked');
      case 'secBase':    return !!($('biWork').value.trim() || $('biJG1').value || $('biBirthplace').value.trim());
      case 'secMgr':     return !!($('biMgrPhone').value.trim() || $('biFdName').value.trim() || $('biFdPhone').value.trim());
      case 'secEmerg':   return !!$('ec1Name').value.trim();
      case 'secEdu':     return !!document.querySelector('[data-sec="secEdu"] input:checked');
      case 'secPay':     return !!document.querySelector('input[name="pay"]:checked');
      case 'secAllergy': return !!document.querySelector('[data-sec="secAllergy"] input:checked');
      case 'secPast':    return !!document.querySelector('[data-sec="secPast"] input:checked');
      case 'secPopu':    return !!document.querySelector('[data-sec="secPopu"] input:checked');
      case 'secCert': {
        var certRows = $('certBody').querySelectorAll('tr');
        for (var ci = 0; ci < certRows.length; ci++) {
          var cSel = certRows[ci].querySelector('select');
          if (cSel && cSel.value) return true;
        }
        return false;
      }
    }
    return false;
  }
  function renderComplete() {
    var pct;
    if (saved) { pct = 100; }
    else {
      var list = ['secCrowd', 'secHealth', 'secBlood', 'secBase', 'secMgr', 'secEmerg', 'secEdu', 'secPay', 'secCert', 'secAllergy', 'secPast', 'secPopu'];
      var done = list.filter(secDone).length;
      pct = Math.round(done / list.length * 100);
    }
    var C = 2 * Math.PI * 16;
    $('ringBar').setAttribute('stroke-dasharray', C.toFixed(1));
    $('ringBar').setAttribute('stroke-dashoffset', (C * (1 - pct / 100)).toFixed(1));
    $('ringTxt').textContent = pct + '%';
    $('ringSvg').classList.toggle('done', pct >= 100);
  }

  /* ================= 视图切换 ================= */
  /* ================= 高血脂专项表：保存 ================= */
  function saveHlpArchive() {
    var missing = [];
    if (!$('hlpTg').value.trim()) missing.push('TG值');
    if (!$('hlpTc').value.trim()) missing.push('TC值');
    if (!$('hlpHdl').value.trim()) missing.push('HDL-C值');
    if (!$('hlpLdl').value.trim()) missing.push('LDL-C值');
    if (!$('hlpCategory').value) missing.push('高血脂分类');
    if (!document.querySelector('input[name="hlpGrade"]:checked')) missing.push('高血脂分级');
    if (!document.querySelector('input[name="hlpComp"]:checked')) missing.push('并发症');
    if (!$('hlpOrg').value) missing.push('建档机构');
    if (!$('hlpDoctor').value) missing.push('建档医生');
    if (!$('hlpCreateDate').value) missing.push('建档日期');
    if (missing.length) { toast('请完善必填项：' + missing.join('、'), 'warning'); return; }
    var fee = $('hlpDrugFee').value.trim();
    if (fee && isNaN(Number(fee))) { toast('每月用于降脂药物费用请填写数字', 'warning'); return; }
    /* 保存成功后显示随访导航项 */
    $('navHlpFollowup').classList.remove('nav-followup-hidden');
    toast('高血脂专项档案保存成功，已新增「高血脂随访」目录', 'success');
  }
  /* 体质指数自动计算（身高/体重变化时联动） */
  function hlpCalcBmi() {
    var h = parseFloat($('hlpHeight').value);
    var w = parseFloat($('hlpWeight').value);
    $('hlpBmi').value = (h > 0 && w > 0) ? (w / ((h / 100) * (h / 100))).toFixed(1) : '';
  }
  /* 是否服用降脂药：选「是」才可填写每月药物费用 */
  function hlpDrugChange() {
    var c = document.querySelector('input[name="hlpDrug"]:checked');
    var el = $('hlpDrugFee');
    if (c && c.value === '是') {
      el.removeAttribute('readonly');
    } else {
      el.setAttribute('readonly', 'readonly');
      el.value = '';
    }
  }

  /* ================= 高血脂随访表 ================= */
  /* 体质指数随身高/体重联动（仍可手动改写） */
  function hlpFuCalcBmi() {
    var h = parseFloat($('hlpFuHeight').value);
    var w = parseFloat($('hlpFuWeight').value);
    if (h > 0 && w > 0) $('hlpFuBmi').value = (w / ((h / 100) * (h / 100))).toFixed(1);
  }
  /* 管理评价选「失访」时开放失访日期/失访原因 */
  function hlpFuEvalChange() {
    var c = document.querySelector('input[name="hlpFuEval"]:checked');
    var isLost = !!c && c.value === '失访';
    ['hlpFuLostDate', 'hlpFuLostReason'].forEach(function (id) {
      var el = $(id);
      if (!el) return;
      el.disabled = !isLost;
      el.style.background = isLost ? '' : '#F5F6FA';
      if (!isLost) el.value = '';
    });
  }
  /* 症状：勾选「无症状」时清空其他项，勾选其他项时取消「无症状」 */
  function bindHlpFuSymptomMutex() {
    var box = $('hlpFuSymptomBox');
    if (!box) return;
    box.addEventListener('change', function (e) {
      var t = e.target;
      if (t.type !== 'checkbox') return;
      var boxes = box.querySelectorAll('input[type="checkbox"]');
      if (t.value === '无症状' && t.checked) {
        boxes.forEach(function (b) { if (b !== t) b.checked = false; });
      } else if (t.value !== '无症状' && t.checked) {
        boxes.forEach(function (b) { if (b.value === '无症状') b.checked = false; });
      }
    });
  }
  /* 用药情况：动态添加一行 */
  function addHlpFuMedRow() {
    var box = $('hlpFuMedBox');
    if (!box) return;
    var row = document.createElement('div');
    row.className = 'hlpfu-med-row';
    row.innerHTML = '<span class="ig-label">药物名称：</span>' +
      '<select class="ctl"><option value="">请选择</option><option>阿托伐他汀</option><option>瑞舒伐他汀</option><option>辛伐他汀</option><option>非诺贝特</option><option>依折麦布</option></select>' +
      '<span class="ig-label">用法用量：</span>' +
      '<select class="ctl"><option value="">请选择</option><option>1</option><option>2</option><option>3</option></select>' +
      '<select class="ctl"><option value="">请选择</option><option>片</option><option>粒</option><option>次</option></select>' +
      '<select class="ctl"><option value="">请选择</option><option>次/日</option><option>次/周</option></select>' +
      '<div class="med-del" onclick="this.closest(\'.hlpfu-med-row\').remove()" title="删除">' +
        '<svg viewBox="0 0 24 24" width="14" height="14" fill="none"><path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2m2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>' +
      '</div>';
    box.appendChild(row);
  }
  /* 高血脂随访表：保存 */
  function saveHlpFollowup() {
    var missing = [];
    if (!$('hlpFuDate').value) missing.push('随访日期');
    if (!document.querySelector('input[name="hlpFuWay"]:checked')) missing.push('随访方式');
    if (!document.querySelector('input[name="hlpFuSymptom"]:checked')) missing.push('症状');
    if (!$('hlpFuSbp').value.trim()) missing.push('收缩压');
    if (!$('hlpFuDbp').value.trim()) missing.push('舒张压');
    if (!$('hlpFuMedName').value) missing.push('药物名称');
    if (!$('hlpFuNextDate').value) missing.push('下次随访日期');
    if (!$('hlpFuDoctor').value.trim()) missing.push('随访医生签名');
    if (!document.querySelector('input[name="hlpFuEval"]:checked')) missing.push('管理评价');
    if (missing.length) { toast('请完善必填项：' + missing.join('、'), 'warning'); return; }
    var evalv = document.querySelector('input[name="hlpFuEval"]:checked').value;
    if (evalv === '失访') {
      if (!$('hlpFuLostDate').value) { toast('管理评价为「失访」时请填写失访日期', 'warning'); return; }
      if (!$('hlpFuLostReason').value.trim()) { toast('管理评价为「失访」时请填写失访原因', 'warning'); return; }
    }
    toast('保存成功：高血脂患者随访记录已归档' + (evalv === '失访' ? '（已标记失访）' : ''), 'success');
  }

  /* ================= 健康教育记录表：富文本编辑器 ================= */
  /* execCommand 为浏览器原生命令集，原型仅做交互演示 */
  var HE_SIZE_SEQ = [2, 3, 4, 5], heSizeIdx = 1;
  function heRtf(cmd) {
    var box = $('heRx');
    if (box) box.focus();
    try {
      if (cmd === 'h3') { document.execCommand('formatBlock', false, 'h3'); return; }
      if (cmd === 'size') { document.execCommand('fontSize', false, HE_SIZE_SEQ[heSizeIdx]); heSizeIdx = (heSizeIdx + 1) % HE_SIZE_SEQ.length; return; }
      if (cmd === 'font') { document.execCommand('fontName', false, '宋体'); return; }
      if (cmd === 'color') { document.execCommand('foreColor', false, '#D4380D'); return; }
      if (cmd === 'image') { toast('插入图片功能建设中', 'info'); return; }
      document.execCommand(cmd, false, null);
    } catch (e) {}
  }
  /* 全屏 / 退出全屏：编辑器浮层铺满视口 */
  function heFullscreen() {
    var rt = $('heRt');
    if (rt) rt.classList.toggle('he-rt-full');
  }
  /* 选择模板：套用一份健康教育处方文本（原型演示） */
  function hePickTemplate() {
    var box = $('heRx');
    if (!box) return;
    box.innerHTML = '<h3>健康教育处方</h3>' +
      '<p>一、饮食：低盐低脂饮食，每日食盐摄入量不超过 5g，少吃动物内脏、油炸食品，多吃新鲜蔬菜和水果。</p>' +
      '<p>二、运动：每周至少 150 分钟中等强度有氧运动（快走、慢跑、太极拳等），运动时心率控制在（170-年龄）次/分以内。</p>' +
      '<p>三、用药：遵医嘱规律服用降脂药物，不可自行停药或减量，注意观察有无肌肉酸痛、乏力等不适。</p>' +
      '<p>四、监测：每 3 个月复查血脂四项，每 6 个月复查肝肾功能，如出现胸痛、肢体麻木等及时就诊。</p>';
    toast('已套用「高血脂健康教育处方」模板', 'success');
  }
  /* 字数统计（上限 300） */
  function heCnt(el, cntId) {
    var c = $(cntId);
    if (c) c.textContent = el.value.length + '/300';
  }
  /* 健康教育记录表：保存 */
  function saveHealthEdu() {
    var missing = [];
    if (!$('heDate').value) missing.push('日期');
    if (!$('heWay').value) missing.push('干预方式');
    if (!$('hePlace').value) missing.push('干预地点');
    if (!$('heOrg').value) missing.push('所在机构');
    if (missing.length) { toast('请完善必填项：' + missing.join('、'), 'warning'); return; }
    toast('保存成功：健康教育记录已归档', 'success');
  }

  /* =========================================================================
     妇女管理模块：妇女档案信息 / 婚前医学检查表 / 叶酸发放登记表
                / 孕前医学检查表 / 已婚妇女常见病免费检查表
     ========================================================================= */
  /* 文本域 / 输入框字数统计（0/200、0/50） */
  function wmCnt(el, cntId) {
    var c = document.getElementById(cntId);
    if (!c || !el) return;
    var max = el.getAttribute('maxlength') || '200';
    c.textContent = (el.value || '').length + '/' + max;
  }
  function wmSetTxt(id, v) {
    var el = document.getElementById(id);
    if (el) el.textContent = (v === undefined || v === null) ? '' : v;
  }
  /* 由出生日期算“39岁3月” */
  function wmAgeText(birth) {
    if (!birth) return '';
    var b = new Date(birth);
    if (isNaN(b.getTime())) return '';
    var n = new Date();
    var y = n.getFullYear() - b.getFullYear();
    var m = n.getMonth() - b.getMonth();
    if (m < 0) { y--; m += 12; }
    if (n.getDate() < b.getDate()) { m--; if (m < 0) { y--; m += 12; } }
    return y + '岁' + m + '月';
  }
  /* 四张检查/登记表共用的档案身份信息（性别/证件号/年龄/民族/联系电话/职业/地址） */
  function wmFillIdentity(pref, liveAddr) {
    var male = (P.gender || '').indexOf('男') === 0;
    wmSetTxt(pref + 'Gender', male ? '男' : '女');
    wmSetTxt(pref + 'Idcard', QS.get('idcard') || P.idcard);
    wmSetTxt(pref + 'Age', wmAgeText(QS.get('birth') || P.birth));
    wmSetTxt(pref + 'Nation', P.nation);
    wmSetTxt(pref + 'Phone', QS.get('phone') || P.phone);
    wmSetTxt(pref + 'Job', '国家机关、党群组织、企业、事业单位负责人');
    wmSetTxt(pref + 'RegAddr', '江苏省扬州市江都区樊川镇三周村' + (P.addr || ''));
    wmSetTxt(pref + 'LiveAddr', liveAddr || ('江苏省扬州市江都区樊川镇三周村' + (P.addr || '')));
  }
  function setChkByName(name, value) {
    var el = document.querySelector('input[name="' + name + '"][value="' + value + '"]');
    if (el) el.checked = true;
  }
  /* 必填校验（t：val 输入/下拉，radio 单选，chk 多选） */
  function wmMissing(list) {
    var missing = [];
    list.forEach(function (it) {
      var ok = false;
      if (it.t === 'val') { var el = $(it.id); ok = !!(el && String(el.value).trim() !== ''); }
      else { ok = !!document.querySelector('input[name="' + it.name + '"]:checked'); }
      if (!ok) missing.push(it.label);
    });
    return missing;
  }
  function wmToastSaved(msg) { toast(msg, 'success'); }
  /* 妇女档案保存成功后开放：婚前医学检查 / 叶酸登记 / 孕前医学检查 / 常见妇女病检查 四个业务目录 */
  function revealWomanModules() {
    ['navPreMarital', 'navFolicAcid', 'navPrePregnancy', 'navWomanDisease'].forEach(function (id) {
      var el = $(id);
      if (el) el.classList.remove('nav-followup-hidden');
    });
  }
  /* 孕产妇档案建档成功后开放：第一次产前检查 / 产前访视 / 分娩记录 / 产后访视 /
     产后42天 / 妊娠风险筛查 / 妊娠风险评估 / 转诊跟踪 八个业务目录 */
  function revealMsModules() {
    ['navMsPrenatal1', 'navMsPrenatalVisit', 'navMsDelivery', 'navMsPostVisit',
     'navMsPost42', 'navMsRiskScreen', 'navMsRiskAssess', 'navMsReferral'].forEach(function (id) {
      var el = $(id);
      if (el) el.classList.remove('nav-followup-hidden');
    });
  }
  /* 建档状态写入 localStorage：刷新 / 重新进入后目录仍然保持展开 */
  var MS_ARCH_KEY = 'hps.msArchCreated';
  function msArchCreated() {
    try { return localStorage.getItem(MS_ARCH_KEY) === '1'; } catch (e) { return false; }
  }
  function msMarkArchCreated() {
    try { localStorage.setItem(MS_ARCH_KEY, '1'); } catch (e) {}
    revealMsModules();
  }
  /* 页面载入时恢复建档状态 */
  function restoreMsModules() {
    if (msArchCreated()) revealMsModules();
  }
  /* =========================================================================
     预防接种模块：预防接种记录信息 / 预防接种记录
     —— 与高血压业务同构：先填报「预防接种记录信息」→ 保存成功
        → 「预防接种」目录下开放「预防接种记录」子菜单（见 revealVaccineModules）
     ========================================================================= */
  var VC_ARCH_NO = '32101210010000313';
  /* 顶部信息栏 + 表单「姓名 / 档案编号」条：统一取儿童本人信息 */
  function vcFillHead() {
    var nm = QS.get('name') || cnFirstVal(['chName', 'cbcName', 'cnvName']) || P.name;
    var no = QS.get('archNo') || VC_ARCH_NO;
    var birth = QS.get('birth') || cnFirstVal(['chBirth', 'cbcBirth', 'cnvBirth']) || P.birth;
    if ($('vciNameTxt')) $('vciNameTxt').textContent = nm;
    if ($('vciArchNo')) $('vciArchNo').textContent = no;
    if ($('vcrNameTxt')) $('vcrNameTxt').textContent = nm;
    if ($('vcrArchNo')) $('vcrArchNo').textContent = no;
    if ($('vciBirth')) $('vciBirth').textContent = birth || '--';
    if ($('vciGender')) {
      $('vciGender').textContent = (QS.get('gender') || P.gender || '男性').indexOf('女') === 0 ? '女' : '男';
    }
    var addr = '';
    if (QS.get('addr')) addr = QS.get('addr').replace(/\//g, '') + (QS.get('addrDetail') || '');
    $('vciHomeAddr') && ($('vciHomeAddr').textContent = addr || '--');
    $('vciRegAddr') && ($('vciRegAddr').textContent = addr || '--');
  }
  /* 「预防接种记录信息」保存成功后开放：预防接种记录 */
  function revealVaccineModules() {
    var el = $('navVaccineRecord');
    if (el) el.classList.remove('nav-followup-hidden');
  }
  /* 糖尿病管理：开放「糖尿病随访 / 糖尿病评估」两个业务目录 */
  function revealDmModules() {
    ['navDmFollowup', 'navDmAssessment'].forEach(function (id) {
      var el = $(id);
      if (el) el.classList.remove('nav-followup-hidden');
    });
  }
  /* 慢病模块：开放各自的「随访」业务目录（慢阻肺/肿瘤/高危/重精/心脑血管/高血脂/结核病） */
  function revealChronicFollowup(group) {
    var map = {
      copd: ['navCopdFollowup'],
      tumor: ['navTumorFollowup'],
      hr: ['navHrFollowup'],
      psi: ['navPsiFollowup'],
      cardio: ['navCardioFollowup'],
      hlp: ['navHlpFollowup'],
      tb: ['navTbFollowup']
    };
    (map[group] || []).forEach(function (id) {
      var el = $(id);
      if (el) el.classList.remove('nav-followup-hidden');
    });
  }
  /* 建卡状态写入 localStorage：刷新 / 重新进入后目录仍然保持展开 */
  var VC_ARCH_KEY = 'hps.vaccineCardCreated';
  function vaccineCardCreated() {
    try { return localStorage.getItem(VC_ARCH_KEY) === '1'; } catch (e) { return false; }
  }
  function vcMarkCreated() {
    try { localStorage.setItem(VC_ARCH_KEY, '1'); } catch (e) {}
    revealVaccineModules();
  }
  function restoreVaccineModules() {
    if (vaccineCardCreated()) revealVaccineModules();
  }
  /* 预防接种记录信息：保存 */
  function saveVaccineInfo() {
    var miss = wmMissing([
      { t: 'val', id: 'vciGuardian', label: '监护人姓名' },
      { t: 'val', id: 'vciRelation', label: '与儿童关系' },
      { t: 'val', id: 'vciPhone', label: '联系电话' },
      { t: 'val', id: 'vciCreateDate', label: '建卡日期' },
      { t: 'val', id: 'vciCreatePhone', label: '建卡单位联系电话' },
      { t: 'val', id: 'vciCreateOrg', label: '建卡机构' },
      { t: 'val', id: 'vciCreateDoc', label: '建卡人' }
    ]);
    if (miss.length) { toast('请完善必填项：' + miss.join('、'), 'warning'); return; }
    vcFillHead();
    vcMarkCreated();
    wmToastSaved('保存成功：预防接种记录信息已建档，可继续填报预防接种记录');
  }
  /* 预防接种记录信息：按设计稿回填 */
  function mockVaccineInfo() {
    vcFillHead();
    setVal('vciBirthHospital', '');
    setVal('vciBirthWeight', '');
    setVal('vciGuardian', '11');
    setVal('vciRelation', '其他');
    setVal('vciPhone', '13987652345');
    setVal('vciReaction', '');
    setVal('vciTaboo', '');
    setVal('vciInfectious', '');
    setVal('vciRemark', '');
    setVal('vciCreateDate', '2023-09-12');
    setVal('vciCreatePhone', '13024771654');
    setVal('vciCreateOrg', '山东大学齐鲁医院');
    setVal('vciCreateDoc', '马思维');
  }
  /* 预防接种记录：清空「接种医生」（设计稿右侧 ⊗ 图标） */
  function clearVaccineDoctor() { setVal('vcrDoctor', ''); }
  /* 预防接种记录：保存 */
  function saveVaccineRecord() {
    var miss = wmMissing([
      { t: 'val', id: 'vcrVaccine', label: '疫苗名称' },
      { t: 'val', id: 'vcrDose', label: '针次' },
      { t: 'val', id: 'vcrDate', label: '接种日期' },
      { t: 'val', id: 'vcrOrg', label: '接种单位' },
      { t: 'val', id: 'vcrDoctor', label: '接种医生' },
      { t: 'val', id: 'vcrRegOrg', label: '登记机构' },
      { t: 'val', id: 'vcrRegDoc', label: '登记人' }
    ]);
    if (miss.length) { toast('请完善必填项：' + miss.join('、'), 'warning'); return; }
    vcFillHead();
    wmToastSaved('保存成功：预防接种记录已登记');
  }
  /* 预防接种记录：按设计稿回填 */
  function mockVaccineRecord() {
    vcFillHead();
    setVal('vcrVaccine', '');
    setVal('vcrDose', '');
    setVal('vcrDate', '');
    setVal('vcrSite', '');
    setVal('vcrOrg', '山东大学齐鲁医院');
    setVal('vcrDoctor', '吕雪');
    setVal('vcrFactory', '');
    setVal('vcrBatch', '');
    setVal('vcrValid', '');
    setVal('vcrRemark', '');
    setVal('vcrRegOrg', '山东大学齐鲁医院');
    setVal('vcrRegDoc', '吕雪');
  }

  /* 妇女档案信息：保存 */
  function saveWomanArchive() {
    var missing = wmMissing([
      { t: 'val', id: 'waName', label: '姓名' },
      { t: 'radio', name: 'waGender', label: '性别' },
      { t: 'val', id: 'waIdType', label: '证件类型' },
      { t: 'val', id: 'waIdcard', label: '证件号码' },
      { t: 'val', id: 'waBirth', label: '出生日期' },
      { t: 'val', id: 'waPhone', label: '联系电话' },
      { t: 'val', id: 'waRegAddr', label: '户籍地址' },
      { t: 'val', id: 'waRegNo', label: '户籍门牌号' },
      { t: 'val', id: 'waLiveAddr', label: '现住址' },
      { t: 'val', id: 'waLiveNo', label: '现住址门牌号' },
      { t: 'radio', name: 'waResType', label: '居民类型' },
      { t: 'radio', name: 'waStayType', label: '常住类型' },
      { t: 'val', id: 'waManageOrg', label: '管理机构' },
      { t: 'val', id: 'waDoctor', label: '责任医生' },
      { t: 'val', id: 'waCreateOrg', label: '建档机构' },
      { t: 'val', id: 'waCreateDate', label: '建档日期' }
    ]);
    if (missing.length) { toast('请完善必填项：' + missing.join('、'), 'warning'); return; }
    wmSetTxt('waNameTxt', $('waName').value.trim());
    revealWomanModules();
    wmToastSaved('保存成功：妇女档案已建立，可继续填报婚前医学检查、叶酸发放、孕前医学检查与常见妇女病检查');
  }
  /* 婚前医学检查表：保存 */
  function savePreMarital() {
    var missing = wmMissing([
      { t: 'val', id: 'pmCoupleNo', label: '夫妻号' },
      { t: 'radio', name: 'pmConsult', label: '是否咨询' },
      { t: 'val', id: 'pmOrg', label: '检查单位' },
      { t: 'val', id: 'pmDoctor', label: '检查医生' },
      { t: 'val', id: 'pmExamDate', label: '检查日期' }
    ]);
    if (missing.length) { toast('请完善必填项：' + missing.join('、'), 'warning'); return; }
    wmToastSaved('保存成功：婚前医学检查表已归档');
  }
  /* 叶酸发放登记表：BMI 自动计算 */
  function faCalcBmi() {
    var h = parseFloat($('faHeight').value);
    var w = parseFloat($('faWeight').value);
    $('faBmi').value = (h > 0 && w > 0) ? (w / ((h / 100) * (h / 100))).toFixed(1) : '';
  }
  /* 叶酸发放登记表：保存 */
  function saveFolicAcid() {
    var missing = wmMissing([
      { t: 'val', id: 'faHeight', label: '身高' },
      { t: 'val', id: 'faWeight', label: '体重' },
      { t: 'radio', name: 'faHighRisk', label: '高危情况' },
      { t: 'val', id: 'faQty', label: '发放数量' },
      { t: 'val', id: 'faUsage', label: '叶酸用法' },
      { t: 'val', id: 'faDose', label: '叶酸用量' },
      { t: 'val', id: 'faOrg', label: '发放单位' },
      { t: 'val', id: 'faDoctor', label: '发放医生' },
      { t: 'val', id: 'faDate', label: '发放日期' }
    ]);
    if (missing.length) { toast('请完善必填项：' + missing.join('、'), 'warning'); return; }
    wmToastSaved('保存成功：叶酸发放记录已登记');
  }
  /* 孕前医学检查表：保存 */
  function savePrePregnancy() {
    var missing = wmMissing([
      { t: 'chk', name: 'ppgPastDis', label: '既往史疾病' },
      { t: 'radio', name: 'ppgOperation', label: '既往史手术史' },
      { t: 'chk', name: 'ppgNowDis', label: '现病史疾病' },
      { t: 'radio', name: 'ppgSmoke', label: '吸烟' },
      { t: 'radio', name: 'ppgPassiveSmoke', label: '被动吸烟' },
      { t: 'val', id: 'ppgMenarche', label: '初潮年龄' },
      { t: 'val', id: 'ppgCycle', label: '月经周期' },
      { t: 'val', id: 'ppgDuration', label: '月经持续时间' },
      { t: 'radio', name: 'ppgFlow', label: '量' },
      { t: 'radio', name: 'ppgDysmenorrhea', label: '痛经' },
      { t: 'val', id: 'ppgLastPeriod', label: '末次月经时间' },
      { t: 'chk', name: 'ppgBirth', label: '孕育史' },
      { t: 'chk', name: 'ppgHeredity', label: '遗传病史疾病' },
      { t: 'radio', name: 'ppgRelativeMarriage', label: '是否近亲结婚' },
      { t: 'chk', name: 'ppgKinship', label: '家族近亲婚配' },
      { t: 'chk', name: 'ppgVaccine', label: '预防接种' },
      { t: 'chk', name: 'ppgHazard', label: '有害环境因素暴露' },
      { t: 'radio', name: 'ppgFolic', label: '增补叶酸/含叶酸的维生素' },
      { t: 'radio', name: 'ppgRecheck', label: '是否需要再次检查' }
    ]);
    if (missing.length) { toast('请完善必填项：' + missing.join('、'), 'warning'); return; }
    wmToastSaved('保存成功：孕前医学检查表已归档');
  }
  /* 已婚妇女常见病免费检查表：保存 */
  function saveWomanDisease() {
    var missing = wmMissing([
      { t: 'radio', name: 'wdContraception', label: '避孕情况' },
      { t: 'chk', name: 'wdVulva', label: '外阴' },
      { t: 'val', id: 'wdFillOrg', label: '填表机构' },
      { t: 'val', id: 'wdFillDoctor', label: '填表医生' },
      { t: 'val', id: 'wdFillDate', label: '填表日期' }
    ]);
    if (missing.length) { toast('请完善必填项：' + missing.join('、'), 'warning'); return; }
    wmToastSaved('保存成功：已婚妇女常见病免费检查表已归档');
  }

  /* ================= 健康信息卡：保存 ================= */
  function saveHealthCard() {
    var missing = [];
    if (!$('hcTel').value.trim()) missing.push('家庭电话');
    if (!$('hcOrgTel').value.trim()) missing.push('建档机构联系人电话');
    if (!$('hcDoctorTel').value.trim()) missing.push('责任医生或护士联系电话');
    if (missing.length) { toast('请完善必填项：' + missing.join('、'), 'warning'); return; }
    toast('保存成功：健康信息卡已归档', 'success');
  }

  /* ================= 死亡登记表：年龄自动计算 ================= */
  function ageFromBirth(birth) {
    if (!birth) return '';
    var b = new Date(birth), n = new Date();
    if (isNaN(b.getTime())) return '';
    var age = n.getFullYear() - b.getFullYear();
    var m = n.getMonth() - b.getMonth();
    if (m < 0 || (m === 0 && n.getDate() < b.getDate())) age--;
    return age >= 0 ? String(age) : '';
  }

  /* ================= 死亡登记表：保存 ================= */
  function saveDeath() {
    var missing = [];
    if (!document.querySelector('input[name="dtIdentity"]:checked')) missing.push('个人身份');
    if (!$('dtDeathDate').value) missing.push('死亡日期');
    if (!$('dtHistory').value.trim()) missing.push('死者生前病史及症状特征');
    if (!$('dtSurveyName').value.trim()) missing.push('被调查者姓名');
    if (!$('dtSurveyTel').value.trim()) missing.push('联系电话');
    if (!document.querySelector('input[name="dtRelation"]:checked')) missing.push('与死者关系');
    if (!$('dtSurveyAddr').value.trim()) missing.push('联系地址或工作单位');
    if (!$('dtInfer').value.trim()) missing.push('死因推断');
    if (!$('dtSurveySign').value.trim()) missing.push('被调查者签名');
    if (missing.length) { toast('请完善必填项：' + missing.join('、'), 'warning'); return; }
    toast('保存成功：居民死亡医学证明（推断）书已归档', 'success');
  }

  /* ================= 卫生健康服务活动记录：行操作 ================= */
  var WSA_CAL_ICO = '<svg class="cal-ico" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9AA7B8" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 11h18"/></svg>';
  var WSA_ORGS = ['山东大学齐鲁医院', '武坚镇周西社区卫生室', '武坚镇卫生院', '江都区疾病预防控制中心', '江都区妇幼保健院', '江都区中医院', '其他医疗卫生机构'];
  var WSA_TYPES = ['健康教育', '健康体检', '预防接种', '慢病随访', '老年保健', '妇女保健', '儿童保健', '中医药保健指导', '传染病防治', '康复指导', '其他'];
  var WSA_EMPTY = { date: '', org: '', type: '', problem: '', report: '', fee: '' };

  /* 服务时间：点击后切换为日期控件并唤起选择器 */
  function wsaPickDate(el) {
    if (el.type !== 'date') el.type = 'date';
    if (el.showPicker) { try { el.showPicker(); } catch (e) {} }
  }
  function wsaBlurDate(el) {
    if (!el.value) el.type = 'text';
  }

  function wsaEsc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function wsaSelect(list, val) {
    var h = '<select class="ctl"><option value=""' + (val ? '' : ' selected') + '>请选择</option>';
    for (var i = 0; i < list.length; i++) {
      h += '<option value="' + wsaEsc(list[i]) + '"' + (list[i] === val ? ' selected' : '') + '>' + wsaEsc(list[i]) + '</option>';
    }
    return h + '</select>';
  }

  /* 录入态单元格：可编辑 + 新增/重置 */
  function wsaEntryCells(idx, rec) {
    rec = rec || WSA_EMPTY;
    var dateCell = rec.date
      ? '<div class="wsa-date"><input class="ctl" type="date" value="' + wsaEsc(rec.date) + '">' + WSA_CAL_ICO + '</div>'
      : '<div class="wsa-date"><input class="ctl" type="text" placeholder="请选择" onclick="wsaPickDate(this)" onblur="wsaBlurDate(this)">' + WSA_CAL_ICO + '</div>';
    return '<td class="wsa-idx">' + idx + '</td>' +
      '<td>' + dateCell + '</td>' +
      '<td>' + wsaSelect(WSA_ORGS, rec.org) + '</td>' +
      '<td>' + wsaSelect(WSA_TYPES, rec.type) + '</td>' +
      '<td><input class="ctl" placeholder="请输入" value="' + wsaEsc(rec.problem) + '"></td>' +
      '<td><input class="ctl" placeholder="请输入" value="' + wsaEsc(rec.report) + '"></td>' +
      '<td><input class="ctl" placeholder="请输入" value="' + wsaEsc(rec.fee) + '"></td>' +
      '<td class="wsa-ops"><a onclick="addWsaRow(this)">新增</a><a class="gray" onclick="resetWsaRow(this)">重置</a></td>';
  }

  /* 只读态单元格：已提交记录 + 编辑/删除 */
  function wsaReadCells(idx, rec) {
    return '<td class="wsa-idx">' + idx + '</td>' +
      '<td>' + wsaEsc(rec.date) + '</td>' +
      '<td>' + wsaEsc(rec.org) + '</td>' +
      '<td>' + wsaEsc(rec.type) + '</td>' +
      '<td>' + wsaEsc(rec.problem) + '</td>' +
      '<td>' + wsaEsc(rec.report) + '</td>' +
      '<td>' + wsaEsc(rec.fee) + '</td>' +
      '<td class="wsa-ops"><a onclick="editWsaRow(this)">编辑</a><a class="danger" onclick="delWsaRow(this)">删除</a></td>';
  }

  function wsaEntryVal(tr) {
    var c = tr.cells;
    return {
      date: c[1].querySelector('input').value.trim(),
      org: c[2].querySelector('select').value,
      type: c[3].querySelector('select').value,
      problem: c[4].querySelector('input').value.trim(),
      report: c[5].querySelector('input').value.trim(),
      fee: c[6].querySelector('input').value.trim()
    };
  }
  function wsaReadVal(tr) {
    var c = tr.cells;
    return {
      date: c[1].textContent.trim(), org: c[2].textContent.trim(), type: c[3].textContent.trim(),
      problem: c[4].textContent.trim(), report: c[5].textContent.trim(), fee: c[6].textContent.trim()
    };
  }
  function wsaIsEntry(tr) { return !tr.classList.contains('is-committed'); }
  function wsaIsEmpty(tr) {
    var v = wsaEntryVal(tr);
    return !v.date && !v.org && !v.type && !v.problem && !v.report && !v.fee;
  }
  function wsaBodyIdx(tr) {
    var rows = $('wsaBody').rows;
    for (var i = 0; i < rows.length; i++) if (rows[i] === tr) return i;
    return -1;
  }
  function renumberWsa() {
    var rows = $('wsaBody').rows;
    for (var i = 0; i < rows.length; i++) rows[i].cells[0].textContent = i + 1;
  }
  function wsaAppendEntry() {
    var tr = document.createElement('tr');
    tr.className = 'is-new';
    tr.innerHTML = wsaEntryCells(1, WSA_EMPTY);
    $('wsaBody').appendChild(tr);
    return tr;
  }

  /* 校验：所有录入行的 服务时间 / 服务机构 / 服务类型 为必填，返回缺失行号 */
  function wsaCheckRows() {
    var rows = $('wsaBody').rows, miss = [];
    for (var i = 0; i < rows.length; i++) {
      if (!wsaIsEntry(rows[i])) continue;
      var v = wsaEntryVal(rows[i]);
      if (!v.date || !v.org || !v.type) miss.push('第 ' + (i + 1) + ' 行');
    }
    return miss;
  }

  /* 新增：当前录入行提交为只读行，并在末尾追加新的录入行 */
  function addWsaRow(link) {
    var miss = wsaCheckRows();
    if (miss.length) { toast('请先完善 ' + miss.join('、') + ' 的服务时间、服务机构、服务类型', 'warning'); return; }
    var tr = link.closest('tr');
    var rec = wsaEntryVal(tr);
    tr.className = 'is-committed';
    tr.innerHTML = wsaReadCells(1, rec);
    wsaAppendEntry();
    renumberWsa();
    toast('已新增一条服务活动记录', 'success');
  }

  /* 编辑：只读行转回录入态（同屏只保留一行录入行） */
  function editWsaRow(link) {
    var tr = link.closest('tr');
    var rec = wsaReadVal(tr);
    var rows = $('wsaBody').rows, last = rows[rows.length - 1];
    if (last !== tr && wsaIsEntry(last) && wsaIsEmpty(last)) $('wsaBody').deleteRow(rows.length - 1);
    tr.className = 'is-new';
    tr.innerHTML = wsaEntryCells(1, rec);
    renumberWsa();
    var inp = tr.cells[1].querySelector('input');
    if (inp) inp.focus();
  }

  /* 删除：移除只读行，末尾始终保留一行录入行 */
  function delWsaRow(link) {
    var tr = link.closest('tr');
    var idx = wsaBodyIdx(tr);
    if (idx >= 0) $('wsaBody').deleteRow(idx);
    var rows = $('wsaBody').rows, hasEntry = false;
    for (var i = 0; i < rows.length; i++) if (wsaIsEntry(rows[i])) hasEntry = true;
    if (!hasEntry) wsaAppendEntry();
    renumberWsa();
    toast('已删除该条服务活动记录', 'info');
  }

  function resetWsaRow(link) {
    var tr = link.closest('tr');
    var inputs = tr.querySelectorAll('input.ctl');
    for (var i = 0; i < inputs.length; i++) { inputs[i].value = ''; inputs[i].type = 'text'; }
    var sels = tr.querySelectorAll('select.ctl');
    for (var j = 0; j < sels.length; j++) sels[j].selectedIndex = 0;
  }

  /* ================= 卫生健康服务活动记录：保存 ================= */
  function saveServiceAct() {
    var rows = $('wsaBody').rows, total = 0, miss = [];
    for (var i = 0; i < rows.length; i++) {
      var tr = rows[i];
      if (!wsaIsEntry(tr)) {
        var rf = wsaReadVal(tr).fee;
        if (rf && isNaN(Number(rf))) { toast('第 ' + (i + 1) + ' 行服务费用请填写数字', 'warning'); return; }
        total++;
        continue;
      }
      var v = wsaEntryVal(tr);
      if (!v.date && !v.org && !v.type && !v.problem && !v.report && !v.fee) continue;
      if (!v.date || !v.org || !v.type) { miss.push('第 ' + (i + 1) + ' 行'); continue; }
      if (v.fee && isNaN(Number(v.fee))) { toast('第 ' + (i + 1) + ' 行服务费用请填写数字', 'warning'); return; }
      total++;
    }
    if (miss.length) { toast('请完善 ' + miss.join('、') + ' 的服务时间、服务机构、服务类型', 'warning'); return; }
    if (!total) { toast('请至少填写一条卫生健康服务活动记录', 'warning'); return; }
    toast('保存成功：已保存 ' + total + ' 条卫生健康服务活动记录', 'success');
  }

  function switchView(name) {
    var isCover = name === 'cover';
    var isBasic = name === 'basic';
    var isHp = name === 'hypertension';
    var isFu = name === 'followup';
    var isAs = name === 'assessment';
    var isDm = name === 'diabetes';
    var isDmFu = name === 'dmFollowup';
    var isDmAs = name === 'dmAssessment';
    var isCopd = name === 'copd';
    var isCopdFu = name === 'copdFollowup';
    var isTumor = name === 'tumor';
    var isTumorFu = name === 'tumorFollowup';
    var isHr = name === 'hr';
    var isHrFu = name === 'hrFollowup';
    var isTb = name === 'tb';
    var isTbFu = name === 'tbFollowup';
    var isPsi = name === 'psi';
    var isPsiFu = name === 'psiFollowup';
    var isCardio = name === 'cardio';
    var isCardioFu = name === 'cardioFollowup';
    var isHlp = name === 'hyperlipidemia';
    var isHlpFu = name === 'hlpFollowup';
    var isHc = name === 'healthCard';
    var isDt = name === 'death';
    var isSa = name === 'serviceAct';
    var isHe = name === 'healthEdu';
    var isWa = name === 'womanArchive';
    var isPm = name === 'preMarital';
    var isFa = name === 'folicAcid';
    var isPpg = name === 'prePregnancy';
    var isWd = name === 'womanDisease';
    var isCh = name === 'childArchive';
    var isCbc = name === 'childBirthCert';
    var isCnv = name === 'childNewbornVisit';
    var isCh18 = name === 'childHealth18m';
    var isCh1230 = name === 'childHealth1230m';
    var isCh36 = name === 'childHealth36y';
    var isCvs = name === 'childVisionNb';
    var isChs = name === 'childHearingNb';
    var isCds = name === 'childDiseaseNb';
    var isCen = name === 'childEyeNb';
    var isCei = name === 'childEyeInfant';
    var isCet = name === 'childEyeToddler';
    var isCep = name === 'childEyePre';
    var isCgr = name === 'childGrowth';
    var isCdt = name === 'childDeath5';
    var isMsArc = name === 'msArchive';
    var isMsP1 = name === 'msPrenatal1';
    var isMsPv = name === 'msPrenatalVisit';
    var isMsDl = name === 'msDelivery';
    var isMsPvs = name === 'msPostVisit';
    var isMsP42 = name === 'msPost42';
    var isRsk = name === 'msRiskScreen';
    var isAsm = name === 'msRiskAssess';
    var isEa = name === 'elderlySelfCare';
    var isEts = name === 'elderTcmService';
    var isTcg = name === 'tcmGuide';
    var isDis = name === 'disability';
    var isVi = name === 'vaccineInfo';
    var isVr = name === 'vaccineRecord';
    var isVcAny = isVi || isVr;
    var isHce = name === 'healthCheckup';
    var isMsAny = isMsArc || isMsP1 || isMsPv || isMsDl || isMsPvs || isMsP42 || isRsk || isAsm;
    var isChildAny = isCh || isCbc || isCnv || isCh18 || isCh1230 || isCh36 ||
      isCvs || isChs || isCds || isCen || isCei || isCet || isCep || isCgr || isCdt;
    /* 顶部信息栏：儿童相关视图（含预防接种）展示儿童本人信息 + 「儿童」标签，其余视图回到居民本人信息 */
    if (isChildAny || isVcAny) {
      $('ptChildTag').style.display = 'inline-flex';
      renderChildBar();
    } else {
      $('ptChildTag').style.display = 'none';
      renderPatientBar();
    }
    $('viewCover').classList.toggle('hidden', !isCover);
    $('viewBasic').classList.toggle('hidden', !isBasic);
    $('viewHypertension').classList.toggle('hidden', !isHp);
    $('viewFollowup').classList.toggle('hidden', !isFu);
    $('viewAssessment').classList.toggle('hidden', !isAs);
    $('viewDiabetes').classList.toggle('hidden', !isDm);
    $('viewDmFollowup').classList.toggle('hidden', !isDmFu);
    $('viewDmAssessment').classList.toggle('hidden', !isDmAs);
    $('viewCopd').classList.toggle('hidden', !isCopd);
    $('viewCopdFollowup').classList.toggle('hidden', !isCopdFu);
    $('viewTumor').classList.toggle('hidden', !isTumor);
    $('viewTumorFollowup').classList.toggle('hidden', !isTumorFu);
    $('viewHr').classList.toggle('hidden', !isHr);
    $('viewHrFollowup').classList.toggle('hidden', !isHrFu);
    $('viewTb').classList.toggle('hidden', !isTb);
    $('viewTbFollowup').classList.toggle('hidden', !isTbFu);
    $('viewPsi').classList.toggle('hidden', !isPsi);
    $('viewPsiFollowup').classList.toggle('hidden', !isPsiFu);
    $('viewCardio').classList.toggle('hidden', !isCardio);
    $('viewCardioFollowup').classList.toggle('hidden', !isCardioFu);
    $('viewHyperlipidemia').classList.toggle('hidden', !isHlp);
    $('viewHlpFollowup').classList.toggle('hidden', !isHlpFu);
    $('viewHealthCard').classList.toggle('hidden', !isHc);
    $('viewDeath').classList.toggle('hidden', !isDt);
    $('viewServiceAct').classList.toggle('hidden', !isSa);
    $('viewHealthEdu').classList.toggle('hidden', !isHe);
    $('viewWomanArchive').classList.toggle('hidden', !isWa);
    $('viewPreMarital').classList.toggle('hidden', !isPm);
    $('viewFolicAcid').classList.toggle('hidden', !isFa);
    $('viewPrePregnancy').classList.toggle('hidden', !isPpg);
    $('viewWomanDisease').classList.toggle('hidden', !isWd);
    $('viewChildArchive').classList.toggle('hidden', !isCh);
    $('viewChildBirthCert').classList.toggle('hidden', !isCbc);
    $('viewChildNewbornVisit').classList.toggle('hidden', !isCnv);
    $('viewChildHealth18m').classList.toggle('hidden', !isCh18);
    $('viewChildHealth1230m').classList.toggle('hidden', !isCh1230);
    $('viewChildHealth36y').classList.toggle('hidden', !isCh36);
    $('viewChildVisionNb').classList.toggle('hidden', !isCvs);
    $('viewChildHearingNb').classList.toggle('hidden', !isChs);
    $('viewChildDiseaseNb').classList.toggle('hidden', !isCds);
    $('viewChildEyeNb').classList.toggle('hidden', !isCen);
    $('viewChildEyeInfant').classList.toggle('hidden', !isCei);
    $('viewChildEyeToddler').classList.toggle('hidden', !isCet);
    $('viewChildEyePre').classList.toggle('hidden', !isCep);
    $('viewChildGrowth').classList.toggle('hidden', !isCgr);
    $('viewChildDeath5').classList.toggle('hidden', !isCdt);
    $('viewMsArchive').classList.toggle('hidden', !isMsArc);
    $('viewMsPrenatal1').classList.toggle('hidden', !isMsP1);
    $('viewMsPrenatalVisit').classList.toggle('hidden', !isMsPv);
    $('viewMsDelivery').classList.toggle('hidden', !isMsDl);
    $('viewMsPostVisit').classList.toggle('hidden', !isMsPvs);
    $('viewMsPost42').classList.toggle('hidden', !isMsP42);
    $('viewMsRiskScreen').classList.toggle('hidden', !isRsk);
    $('viewMsRiskAssess').classList.toggle('hidden', !isAsm);
    $('viewElderlySelfCare').classList.toggle('hidden', !isEa);
    $('viewElderTcmService').classList.toggle('hidden', !isEts);
    $('viewTcmGuide').classList.toggle('hidden', !isTcg);
    $('viewDisability').classList.toggle('hidden', !isDis);
    $('viewVaccineInfo').classList.toggle('hidden', !isVi);
    $('viewVaccineRecord').classList.toggle('hidden', !isVr);
    $('viewHealthCheckup').classList.toggle('hidden', !isHce);
    $('navCover').classList.toggle('active', isCover);
    $('navBasic').classList.toggle('active', isBasic);
    $('navHpSpecial').classList.toggle('active', isHp);
    $('navHpFollowup').classList.toggle('active', isFu);
    $('navHpAssessment').classList.toggle('active', isAs);
    $('navDmSpecial').classList.toggle('active', isDm);
    $('navDmFollowup').classList.toggle('active', isDmFu);
    $('navDmAssessment').classList.toggle('active', isDmAs);
    $('navCopdSpecial').classList.toggle('active', isCopd);
    $('navCopdFollowup').classList.toggle('active', isCopdFu);
    $('navTumorSpecial').classList.toggle('active', isTumor);
    $('navTumorFollowup').classList.toggle('active', isTumorFu);
    $('navHrSpecial').classList.toggle('active', isHr);
    $('navHrFollowup').classList.toggle('active', isHrFu);
    $('navTbSpecial').classList.toggle('active', isTb);
    $('navTbFollowup').classList.toggle('active', isTbFu);
    $('navPsiSpecial').classList.toggle('active', isPsi);
    $('navPsiFollowup').classList.toggle('active', isPsiFu);
    $('navCardioSpecial').classList.toggle('active', isCardio);
    $('navCardioFollowup').classList.toggle('active', isCardioFu);
    $('navHlpSpecial').classList.toggle('active', isHlp);
    $('navHlpFollowup').classList.toggle('active', isHlpFu);
    $('navHealthCard').classList.toggle('active', isHc);
    $('navDeath').classList.toggle('active', isDt);
    $('navServiceAct').classList.toggle('active', isSa);
    $('navHealthEdu').classList.toggle('active', isHe);
    $('navWomanArchive').classList.toggle('active', isWa);
    $('navPreMarital').classList.toggle('active', isPm);
    $('navFolicAcid').classList.toggle('active', isFa);
    $('navPrePregnancy').classList.toggle('active', isPpg);
    $('navWomanDisease').classList.toggle('active', isWd);
    $('navChildArchive').classList.toggle('active', isCh);
    $('navChildBirthCert').classList.toggle('active', isCbc);
    $('navChildNbVisit').classList.toggle('active', isCnv);
    $('navChildCheck18').classList.toggle('active', isCh18);
    $('navChildCheck1230').classList.toggle('active', isCh1230);
    $('navChildCheck36').classList.toggle('active', isCh36);
    $('navChildVisionNb').classList.toggle('active', isCvs);
    $('navChildHearingNb').classList.toggle('active', isChs);
    $('navChildDiseaseNb').classList.toggle('active', isCds);
    $('navChildEyeNb').classList.toggle('active', isCen);
    $('navChildEyeInfant').classList.toggle('active', isCei);
    $('navChildEyeToddler').classList.toggle('active', isCet);
    $('navChildEyePre').classList.toggle('active', isCep);
    $('navChildGrowth').classList.toggle('active', isCgr);
    $('navChildDeath5').classList.toggle('active', isCdt);
    $('navMsArchive').classList.toggle('active', isMsArc);
    $('navMsPrenatal1').classList.toggle('active', isMsP1);
    $('navMsPrenatalVisit').classList.toggle('active', isMsPv);
    $('navMsDelivery').classList.toggle('active', isMsDl);
    $('navMsPostVisit').classList.toggle('active', isMsPvs);
    $('navMsPost42').classList.toggle('active', isMsP42);
    $('navMsRiskScreen').classList.toggle('active', isRsk);
    $('navMsRiskAssess').classList.toggle('active', isAsm);
    $('navElderlySelfCare').classList.toggle('active', isEa);
    $('navElderTcmService').classList.toggle('active', isEts);
    $('navTcmGuide').classList.toggle('active', isTcg);
    $('navDisability').classList.toggle('active', isDis);
    $('navVaccineInfo').classList.toggle('active', isVi);
    $('navVaccineRecord').classList.toggle('active', isVr);
    $('navHealthCheckup').classList.toggle('active', isHce);
    $('btnSave').style.display = (isCover || isHc || isDt || isSa || isHe || isWa || isPm || isFa || isPpg || isWd || isChildAny || isMsAny || isEa || isDis || isVcAny || isHce) ? 'none' : '';
    if (isHp || isFu || isAs) {
      $('navHpGroup').classList.add('open');
      $('pvContent').scrollTop = 0;
    } else if (isDm || isDmFu || isDmAs) {
      $('navDmGroup').classList.add('open');
      $('pvContent').scrollTop = 0;
    } else if (isCopd || isCopdFu) {
      $('navCopdGroup').classList.add('open');
      $('pvContent').scrollTop = 0;
    } else if (isTumor || isTumorFu) {
      $('navTumorGroup').classList.add('open');
      $('pvContent').scrollTop = 0;
    } else if (isHr || isHrFu) {
      $('navHrGroup').classList.add('open');
      $('pvContent').scrollTop = 0;
    } else if (isTb || isTbFu) {
      $('navTbGroup').classList.add('open');
      $('pvContent').scrollTop = 0;
    } else if (isPsi || isPsiFu) {
      $('navPsiGroup').classList.add('open');
      $('pvContent').scrollTop = 0;
    } else if (isCardio || isCardioFu) {
      $('navCardioGroup').classList.add('open');
      $('pvContent').scrollTop = 0;
    } else if (isHlp || isHlpFu) {
      $('navHlpGroup').classList.add('open');
      $('pvContent').scrollTop = 0;
    } else if (isWa || isPm || isFa || isPpg || isWd) {
      $('navWomanGroup').classList.add('open');
      $('pvContent').scrollTop = 0;
    } else if (isChildAny) {
      $('navChildGroup').classList.add('open');
      $('pvContent').scrollTop = 0;
    } else if (isMsAny) {
      $('navMsGroup').classList.add('open');
      $('pvContent').scrollTop = 0;
    } else if (isEa) {
      $('navElderlyGroup').classList.add('open');
      $('pvContent').scrollTop = 0;
    } else if (isEts) {
      $('navTcmGroup').classList.add('open');
      $('pvContent').scrollTop = 0;
    } else if (isTcg) {
      $('navTcmGroup').classList.add('open');
      $('pvContent').scrollTop = 0;
    } else if (isVcAny) {
      $('navVaccineGroup').classList.add('open');
      $('pvContent').scrollTop = 0;
    } else if (isDis) {
      $('pvContent').scrollTop = 0;
    } else if (isHce) {
      $('pvContent').scrollTop = 0;
      hcSyncRail();
    } else if (isBasic) {
      renderComplete();
      $('pvContent').scrollTop = 0;
    }
  }

  /* ================= 左侧导航分组展开/收起 ================= */
  function toggleNavGroup(groupId) {
    document.getElementById(groupId).classList.toggle('open');
  }

  /* ================= 高血压专项表：BMI 自动计算 ================= */
  function calcBmi() {
    var h = parseFloat($('hpHeight').value);
    var w = parseFloat($('hpWeight').value);
    if (h > 0 && w > 0) {
      var bmi = w / ((h / 100) * (h / 100));
      $('hpBmi').value = bmi.toFixed(1);
    } else {
      $('hpBmi').value = '';
    }
  }

  /* ================= 高血压专项表：根据血压自动判定分级（公卫标准） ================= */
  /* 分级标准：一级 140-159/90-99，二级 160-179/100-109，三级 ≥180/≥110，收缩压与舒张压分属不同级别时以较高级别为准 */
  function autoHpGrade() {
    var sbp = parseInt($('hpSbp').value);
    var dbp = parseInt($('hpDbp').value);
    if (!sbp || !dbp || sbp <= 0 || dbp <= 0) return;
    var grade = '';
    if (sbp >= 180 || dbp >= 110) {
      grade = '三级';
    } else if (sbp >= 160 || dbp >= 100) {
      grade = '二级';
    } else if (sbp >= 140 || dbp >= 90) {
      grade = '一级';
    } else {
      grade = '其他';
    }
    var radios = document.querySelectorAll('input[name="hpGrade"]');
    radios.forEach(function (r) { r.checked = (r.value === grade); });
  }

  /* ================= 高血压专项表：保存 ================= */
  function saveHpArchive() {
    var missing = [];
    if (!$('hpHeight').value.trim()) missing.push('身高');
    if (!$('hpWeight').value.trim()) missing.push('体重');
    if (!$('hpSbp').value.trim()) missing.push('收缩压');
    if (!$('hpDbp').value.trim()) missing.push('舒张压');
    if (!$('hpDiagDate').value) missing.push('确诊日期');
    if (!$('hpCreateOrg').value) missing.push('建档机构');
    if (!$('hpCreateDoc').value) missing.push('建档医生');
    if (!$('hpCreateDate').value) missing.push('建档日期');
    if (missing.length) { toast('请完善必填项：' + missing.join('、'), 'warning'); return; }
    /* 保存成功后显示随访和评估导航项 */
    $('navHpFollowup').classList.remove('nav-followup-hidden');
    $('navHpAssessment').classList.remove('nav-followup-hidden');
    toast('高血压专项表保存成功，已新增高血压随访、高血压评估目录', 'success');
  }

  /* ================= 高血压专项表：并发症互斥（勾"无"清其他） ================= */
  function bindHpComplMutex() {
    $('hpComplicationBox').addEventListener('change', function (e) {
      var t = e.target;
      if (t.type !== 'checkbox' || t.name !== 'hpCompl') return;
      var boxes = $('hpComplicationBox').querySelectorAll('input[type="checkbox"]');
      if (t.value === '无' && t.checked) {
        boxes.forEach(function (b) { if (b !== t) b.checked = false; });
      } else if (t.value !== '无' && t.checked) {
        boxes.forEach(function (b) { if (b.value === '无') b.checked = false; });
      }
    });
  }

  /* ================= 糖尿病专项表：BMI 自动计算 ================= */
  function calcDmBmi() {
    var h = parseFloat($('dmHeight').value);
    var w = parseFloat($('dmWeight').value);
    if (h > 0 && w > 0) {
      var bmi = w / ((h / 100) * (h / 100));
      $('dmBmi').value = bmi.toFixed(1);
    } else {
      $('dmBmi').value = '';
    }
  }

  /* ================= 糖尿病专项表：根据空腹血糖自动判定分级（公卫标准） ================= */
  /* 分级标准：一级 空腹血糖<7.0（控制达标），二级 7.0≤空腹血糖<10.0（控制一般），三级 ≥10.0（控制差）；输入后自动勾选，也支持手动改选 */
  function autoDmGrade() {
    var fbg = parseFloat($('dmFbg').value);
    if (isNaN(fbg) || fbg <= 0) return;
    var grade = fbg >= 10 ? '三级' : (fbg >= 7 ? '二级' : '一级');
    var radios = document.querySelectorAll('input[name="dmGrade"]');
    radios.forEach(function (r) { r.checked = (r.value === grade); });
  }

  /* ================= 糖尿病专项表：是否注射胰岛素联动剂型可选 ================= */
  function toggleDmInsulin() {
    var sel = document.querySelector('input[name="dmInsulin"]:checked');
    var on = !!sel && sel.value === '是';
    document.querySelectorAll('input[name="dmInsulinType"]').forEach(function (c) {
      c.disabled = !on;
      if (!on) c.checked = false;
    });
  }

  /* ================= 糖尿病专项表：保存 ================= */
  function saveDmArchive() {
    var missing = [];
    if (!$('dmFbg').value.trim()) missing.push('空腹血糖');
    if (!$('dmDiagDate').value) missing.push('确诊日期');
    if (!$('dmCreateOrg').value) missing.push('建档机构');
    if (!$('dmCreateDoc').value) missing.push('建档医生');
    if (!$('dmCreateDate').value) missing.push('建档日期');
    if (missing.length) { toast('请完善必填项：' + missing.join('、'), 'warning'); return; }
    /* 保存成功后显示随访和评估导航项 */
    $('navDmFollowup').classList.remove('nav-followup-hidden');
    $('navDmAssessment').classList.remove('nav-followup-hidden');
    toast('糖尿病专项表保存成功，已新增糖尿病随访、糖尿病评估目录', 'success');
  }

  /* ================= 糖尿病评估表：保存 ================= */
  function saveDmAssessment() {
    var missing = [];
    if (!document.querySelector('input[name="dmAsManage"]:checked')) missing.push('管理程度');
    if (!$('dmAsDoctor').value) missing.push('评估医生');
    if (!$('dmAsDate').value) missing.push('评估日期');
    if (missing.length) { toast('请完善必填项：' + missing.join('、'), 'warning'); return; }
    toast('糖尿病评估记录表保存成功', 'success');
  }

  /* ================= 慢阻肺专项表：保存 ================= */
  function saveCopdArchive() {
    var missing = [];
    if (!$('copdCreateOrg').value) missing.push('建档机构');
    if (!$('copdDiagDate').value) missing.push('确诊日期');
    if (!$('copdCreateDate').value) missing.push('建档日期');
    if (missing.length) { toast('请完善必填项：' + missing.join('、'), 'warning'); return; }
    /* 保存成功后显示随访导航项 */
    $('navCopdFollowup').classList.remove('nav-followup-hidden');
    toast('慢阻肺病人专项表保存成功，已新增慢阻肺随访目录', 'success');
  }

  /* ================= 慢阻肺随访表：保存 ================= */
  function saveCopdFollowup() {
    var missing = [];
    if (!$('cfDate').value) missing.push('随访日期');
    if (!$('cfNextDate').value) missing.push('下次随访日期');
    var status = $('cfStatus').value;
    if (status !== '正常') {
      if (!$('cfLostDate').value) missing.push(status === '死亡' ? '死亡日期' : '失访日期');
    }
    if (!document.querySelector('input[name="cfCategory"]:checked')) missing.push('此次随访分类');
    if (!document.querySelector('input[name="cfGrade"]:checked')) missing.push('分级');
    if (missing.length) { toast('请完善必填项：' + missing.join('、'), 'warning'); return; }
    toast('慢阻肺患者随访表保存成功', 'success');
  }

  /* ================= 肿瘤专项表：吸烟史联动（从不吸烟时禁用吸烟明细） ================= */
  function tmSmokeChange() {
    var smoke = (document.querySelector('input[name="tmSmoke"]:checked') || {}).value;
    var smoked = smoke === '目前仍吸烟' || smoke === '已吸烟';
    ['tmSmokeStartAge', 'tmQuitAge', 'tmSmokeYears', 'tmCigsPerDay'].forEach(function (id) {
      var el = $(id);
      el.disabled = !smoked;
      if (!smoked) el.value = '';
    });
  }

  /* ================= 肿瘤专项表：TNM 分期不详联动 ================= */
  function tmTnmChange() {
    var unknown = $('tmTnmUnknown').checked;
    ['tmTnmT', 'tmTnmN', 'tmTnmM'].forEach(function (id) {
      var el = $(id);
      el.disabled = unknown;
      if (unknown) el.value = '';
    });
  }

  /* ================= 肿瘤专项表：保存 ================= */
  function saveTumorArchive() {
    var missing = [];
    if (!$('tmMorphCode').value) missing.push('ICD-0-3形态学编码');
    if (!$('tmMorphName').value.trim()) missing.push('ICD-0-3形态学名称');
    if (!$('tmTopoCode').value) missing.push('ICD-0-3解剖学编码');
    if (!$('tmTopoName').value.trim()) missing.push('ICD-0-3解剖学名称');
    if (!$('tmIcd10').value) missing.push('ICD-10编码');
    if (!$('tmDiagName').value.trim()) missing.push('肿瘤诊断名称');
    if (!$('tmContact').value.trim()) missing.push('联系人');
    if (!$('tmContactTel').value.trim()) missing.push('联系人电话');
    if (!document.querySelector('input[name="tmClinical"]:checked')) missing.push('肿瘤临床分期');
    if (!$('tmGrad').value) missing.push('分级(Grad)');
    if (!$('tmBasis').value) missing.push('肿瘤诊断依据');
    if (!$('tmFirstDiagDate').value) missing.push('首次诊断日期');
    if (!$('tmDiagDate').value) missing.push('确诊日期');
    if (!$('tmFirstTreat').value) missing.push('首次治疗情况');
    if (!$('tmKps').value.trim()) missing.push('卡氏评分');
    if (!$('tmReportOrg').value) missing.push('报告机构');
    if (!$('tmReporter').value) missing.push('报告医师');
    if (!$('tmReportDate').value) missing.push('报告日期');
    if (!$('tmCreateOrg').value) missing.push('建档机构');
    if (!$('tmCreator').value.trim()) missing.push('建档医师');
    if (!$('tmCreateDate').value) missing.push('建档日期');
    if (missing.length) { toast('请完善必填项：' + missing.join('、'), 'warning'); return; }
    /* 保存成功后显示肿瘤随访导航项 */
    $('navTumorFollowup').classList.remove('nav-followup-hidden');
    toast('恶性肿瘤病例专项表保存成功，已新增肿瘤随访目录', 'success');
  }

  /* ================= 肿瘤随访表：BMI 自动计算 ================= */
  function tfCalcBmi() {
    var h = parseFloat($('tfHeight').value);
    var w = parseFloat($('tfWeight').value);
    if (h > 0 && w > 0) {
      $('tfBmi').value = (w / ((h / 100) * (h / 100))).toFixed(1);
    } else {
      $('tfBmi').value = '';
    }
  }

  /* ================= 肿瘤随访表：卡氏(karnofsky)评分选中 ================= */
  function pickTfKps(row) {
    var rows = document.querySelectorAll('#tfKpsList .kps-row');
    rows.forEach(function (r) { r.classList.toggle('selected', r === row); });
  }

  /* ================= 肿瘤随访表：保存 ================= */
  function saveTumorFollowup() {
    var missing = [];
    if (!$('tfDate').value) missing.push('随访日期');
    if (!document.querySelector('input[name="tfWay"]:checked')) missing.push('随访方式');
    if (!document.querySelector('input[name="tfNowState"]:checked')) missing.push('目前情况');
    if (!document.querySelector('input[name="tfGuide"]:checked')) missing.push('指导内容');
    if (!$('tfReferral').value.trim()) missing.push('转诊分析');
    if (!$('tfDoctor').value) missing.push('随访医生');
    if (!$('tfChecker').value) missing.push('检查医师');
    if (!document.querySelector('input[name="tfState"]:checked')) missing.push('随访状态');
    if (!$('tfNextDate').value) missing.push('下次随访时间');
    if (missing.length) { toast('请完善必填项：' + missing.join('、'), 'warning'); return; }
    toast('恶性肿瘤随访表保存成功', 'success');
  }

  /* ================= 高危专项表：BMI 自动计算 ================= */
  function hrCalcBmi() {
    var h = parseFloat($('hrHeight').value);
    var w = parseFloat($('hrWeight').value);
    $('hrBmi').value = (h > 0 && w > 0) ? (w / ((h / 100) * (h / 100))).toFixed(1) : '';
  }

  /* ================= 高危专项表：保存 ================= */
  function saveHrSpecial() {
    var missing = [];
    if (!$('hrHeight').value) missing.push('身高');
    if (!$('hrWeight').value) missing.push('体重');
    if (!$('hrWaist').value) missing.push('腰围');
    if (!$('hrFbg').value.trim()) missing.push('血糖');
    if (!$('hrSbp').value) missing.push('收缩压');
    if (!$('hrDbp').value) missing.push('舒张压');
    if (!document.querySelector('input[name="hrType"]:checked')) missing.push('高危类型');
    if (!$('hrOrg').value) missing.push('随访机构');
    if (!$('hrCheckType').value) missing.push('检查类型');
    if (!$('hrFollowDate').value) missing.push('随访日期');
    if (missing.length) { toast('请完善必填项：' + missing.join('、'), 'warning'); return; }
    /* 保存成功后显示高危随访导航项 */
    $('navHrFollowup').classList.remove('nav-followup-hidden');
    toast('高危人群专项表保存成功，已新增高危随访目录', 'success');
  }

  /* ================= 高危随访表：BMI 自动计算 ================= */
  function hfCalcBmi() {
    var h = parseFloat($('hfHeight').value);
    var w = parseFloat($('hfWeight').value);
    $('hfBmi').value = (h > 0 && w > 0) ? (w / ((h / 100) * (h / 100))).toFixed(1) : '';
  }

  /* ================= 高危随访表：转诊联动（转诊时开放结转管理原因） ================= */
  function hrReferralChange() {
    var go = document.querySelector('input[name="hfReferral"]:checked').value === '是';
    $('hfTransferReason').disabled = !go;
    if (!go) $('hfTransferReason').value = '';
  }

  /* ================= 高危随访表：随访状态联动（失访/死亡时开放日期与原因录入） ================= */
  function hrStatusChange() {
    var status = $('hfStatus').value;
    var lost = status !== '正常';
    $('hfLostDate').disabled = !lost;
    $('hfLostReason').disabled = !lost;
    if (!lost) { $('hfLostDate').value = ''; $('hfLostReason').value = ''; }
    $('hfLostDateLabel').textContent = status === '死亡' ? '死亡日期' : '失访日期/死亡日期';
    $('hfLostReasonLabel').textContent = status === '死亡' ? '死亡原因' : '失访原因/死亡原因';
  }

  /* ================= 高危随访表：保存 ================= */
  function saveHrFollowup() {
    var missing = [];
    if (!$('hfDate').value) missing.push('随访日期');
    if (!document.querySelector('input[name="hfWay"]:checked')) missing.push('随访方式');
    if (!$('hfSbp').value) missing.push('收缩压');
    if (!$('hfDbp').value) missing.push('舒张压');
    if (!document.querySelector('input[name="hfResult"]:checked')) missing.push('随访结果');
    if (!document.querySelector('input[name="hfReferral"]:checked')) missing.push('是否转诊');
    if (!$('hfDoctor').value) missing.push('转诊医生');
    if (!$('hfNextDate').value) missing.push('下次随访日期');
    if (!$('hfStatus').value) missing.push('随访状态');
    if (missing.length) { toast('请完善必填项：' + missing.join('、'), 'warning'); return; }
    toast('高危人群随访记录表保存成功', 'success');
  }

  /* ================= 结核病随访表：失访/死亡联动 ================= */
  function tb2LostChange() {
    var status = $('tb2Lost').value;
    var lost = status !== '正常';
    $('tb2LostReason').disabled = !lost;
    if (!lost) $('tb2LostReason').value = '';
    $('tb2LostReasonLabel').textContent = status === '死亡' ? '死亡原因' : (status === '失访' ? '失访原因' : '失访原因/死亡原因');
  }

  /* ================= 结核病第一次入户随访表：保存 ================= */
  function saveTbFirst() {
    var missing = [];
    if (!$('tb1Date').value) missing.push('随访时间');
    if (!document.querySelector('input[name="tb1Way"]:checked')) missing.push('随访方式');
    if (!document.querySelector('input[name="tb1Cure"]:checked')) missing.push('治愈类型');
    if (!document.querySelector('input[name="tb1Quit"]:checked')) missing.push('戒烟情况');
    if (!document.querySelector('input[name="tb1Symptom"]:checked')) missing.push('症状及体征');
    if (!$('tb1Plan').value.trim()) missing.push('化疗方案');
    if (!$('tb1Next').value) missing.push('下次随访时间');
    if (!$('tb1Doctor').value) missing.push('随访医生签名');
    if (missing.length) { toast('请完善必填项：' + missing.join('、'), 'warning'); return; }
    /* 保存成功后显示患者随访导航项 */
    $('navTbFollowup').classList.remove('nav-followup-hidden');
    toast('结核病第一次入户随访记录表保存成功，已新增肺结核随访目录', 'success');
  }

  /* ================= 结核病患者随访服务记录表：保存 ================= */
  function saveTbFollowup() {
    var missing = [];
    if (!$('tb2Month').value) missing.push('治疗月序');
    if (!document.querySelector('input[name="tb2Supervise"]:checked')) missing.push('督导人员');
    if (!document.querySelector('input[name="tb2Symptom"]:checked')) missing.push('症状及体征');
    if (!$('tb2Next').value) missing.push('下次随访时间');
    if (!$('tb2Doctor').value) missing.push('随访医生签名');
    if (missing.length) { toast('请完善必填项：' + missing.join('、'), 'warning'); return; }
    toast('结核病患者随访服务记录表保存成功', 'success');
  }

  /* ================= 重精管理：个人信息补充表 ================= */
  /* 专科医生意见字数计数 */
  function psi1OpinionCount() {
    var n = $('psi1Opinion').value.length;
    $('psi1OpinionCount').textContent = n + '/100';
  }
  /* 住院选项联动：仅「综合医院精神专科」开放次数录入 */
  function psi1HospChange() {
    var v = document.querySelector('input[name="psi1Hosp"]:checked');
    var on = v && v.value === '综合医院精神专科';
    $('psi1HospTimes').disabled = !on;
    if (!on) $('psi1HospTimes').value = '';
  }
  /* 保存：个人信息补充表 */
  function savePsiSpecial() {
    var missing = [];
    if (!document.querySelector('input[name="psi1Household"]:checked')) missing.push('户别');
    if (!$('psi1Sign').value.trim()) missing.push('签字');
    if (!$('psi1SignDate').value) missing.push('签字日期');
    if (!$('psi1Doctor').value) missing.push('医生签名');
    if (!$('psi1FillDate').value) missing.push('填表日期');
    if (missing.length) { toast('请完善必填项：' + missing.join('、'), 'warning'); return; }
    /* 保存成功后显示重精随访导航项 */
    $('navPsiFollowup').classList.remove('nav-followup-hidden');
    toast('严重精神障碍患者个人信息补充表保存成功，已新增重精随访目录', 'success');
  }

  /* ================= 重精管理：随访服务记录表 ================= */
  /* 保存：随访服务记录表 */
  function savePsiFollowup() {
    var missing = [];
    if (!$('psi2Date').value) missing.push('随访日期');
    if (!document.querySelector('input[name="psi2Way"]:checked')) missing.push('随访方式');
    if (!document.querySelector('input[name="psi2Category"]:checked')) missing.push('本次随访分类');
    if (!$('psi2Doctor').value) missing.push('随访医生');
    if (!$('psi2Next').value) missing.push('下次随访日期');
    if (missing.length) { toast('请完善必填项：' + missing.join('、'), 'warning'); return; }
    toast('严重精神障碍患者随访服务记录表保存成功', 'success');
  }

  /* ================= 心脑血管管理：评估表 ================= */
  /* 体质指数自动计算 */
  function caCalcBmi() {
    var h = parseFloat($('caHeight').value);
    var w = parseFloat($('caWeight').value);
    $('caBmi').value = (h > 0 && w > 0) ? (w / ((h / 100) * (h / 100))).toFixed(1) : '';
  }
  /* 保存：心脑血管评估 */
  function saveCardioAssessment() {
    var missing = [];
    var radios = {
      caHypertension: '高血压病', caGlucoseAbn: '血糖异常', caSmoking: '吸烟情况',
      caStrokeHis: '脑卒中病史', caDiabetes: '糖尿病', caOverweight: '明显超重或肥胖',
      caExercise: '运动锻炼情况', caAf: '心房颤动/房颤性心脏病', caSbpHigh: 'SBP≥160mmHg和/或DBP≥100mmHg',
      caLdlHigh: 'LDL≥4.14mmol/L', caHdlLow: 'HDL<0.78mmol/L', caMi: '心肌梗死病史',
      caPci: '接受经皮冠状动脉介入治疗', caCabg: '接受冠状动脉搭桥手术', caStroke2: '脑卒中病史',
      caTenYearRisk: '10年心脑血管患病风险≥20%', caStrokeConclusion: '脑中风风险评估结论',
      caConclusion: '心脑血管患病风险评估结论', caReferral: '是否转诊'
    };
    for (var n in radios) {
      if (!document.querySelector('input[name="' + n + '"]:checked')) missing.push(radios[n]);
    }
    if (!$('caWeight').value) missing.push('体重');
    if (!$('caSbp1').value || !$('caDbp1').value) missing.push('在医院测血压');
    if (!$('caSbp2').value || !$('caDbp2').value) missing.push('在家自测血压');
    if (!$('caTg').value) missing.push('甘油三酯');
    if (!$('caLdl').value) missing.push('低密度脂蛋白胆固醇');
    if (!$('caHdl').value) missing.push('高密度脂蛋白胆固醇');
    if (!$('caAssessDate').value) missing.push('评估日期');
    if (!$('caAssessOrg').value) missing.push('评估机构');
    if (missing.length) { toast('请完善必填项：' + missing.join('、'), 'warning'); return; }
    /* 保存成功后显示心脑血管随访导航项 */
    $('navCardioFollowup').classList.remove('nav-followup-hidden');
    toast('心脑血管评估保存成功，已新增心脑血管随访目录', 'success');
  }

  /* ================= 心脑血管管理：高危人群随访 ================= */
  /* 当前/目标体质指数自动计算 */
  function cvCalcBmi() {
    var h = parseFloat($('cvHeight').textContent);
    var w = parseFloat($('cvWeight').value);
    var tw = parseFloat($('cvTargetWeight').value);
    $('cvBmi').value = (h > 0 && w > 0) ? (w / ((h / 100) * (h / 100))).toFixed(1) : '';
    $('cvTargetBmi').value = (h > 0 && tw > 0) ? (tw / ((h / 100) * (h / 100))).toFixed(1) : '';
  }
  /* 其他症状字数计数 */
  function cvSymCount() {
    $('cvSymCount').textContent = $('cvOtherSym').value.length + '/50';
  }
  /* 危险因素控制及治疗建议字数计数 */
  function cvAdviceCount() {
    $('cvAdviceCount').textContent = $('cvAdvice').value.length + '/200';
  }
  /* 随访状态联动（失访/死亡时开放日期与原因录入） */
  function cvStatusChange() {
    var status = $('cvStatus').value;
    var lost = status !== '正常';
    $('cvLostDate').disabled = !lost;
    $('cvLostReason').disabled = !lost;
    if (!lost) { $('cvLostDate').value = ''; $('cvLostReason').value = ''; }
    $('cvLostDateLabel').textContent = status === '死亡' ? '死亡日期' : '失访日期/死亡日期';
    $('cvLostReasonLabel').textContent = status === '死亡' ? '死亡原因' : '失访原因/死亡原因';
  }
  /* 保存：心脑血管高危人群随访 */
  function saveCardioFollowup() {
    var missing = [];
    if (!$('cvFDate').value) missing.push('随访日期');
    if (!document.querySelector('input[name="cvWay"]:checked')) missing.push('随访方式');
    if (!$('cvAdvice').value.trim()) missing.push('危险因素控制及治疗建议');
    if (!document.querySelector('input[name="cvGuide"]:checked')) missing.push('指导干预意见');
    if (!$('cvFDoctor').value) missing.push('随访医生签名');
    if (!$('cvNext').value) missing.push('下次随访日期');
    if (!document.querySelector('input[name="cvStatus"]:checked') && !$('cvStatus').value) missing.push('随访状态');
    if (missing.length) { toast('请完善必填项：' + missing.join('、'), 'warning'); return; }
    toast('心脑血管高危人群随访保存成功', 'success');
  }

  /* 慢阻肺随访表：随访状态联动（失访/死亡时开放日期与原因录入） */
  function cfStatusChange() {
    var status = $('cfStatus').value;
    var lost = status !== '正常';
    $('cfLostDate').disabled = !lost;
    $('cfLostReason').disabled = !lost;
    if (!lost) { $('cfLostDate').value = ''; $('cfLostReason').value = ''; }
    $('cfLostDateLabel').textContent = status === '死亡' ? '死亡日期' : '失访日期/死亡日期';
    $('cfLostReasonLabel').textContent = status === '死亡' ? '死亡原因' : '失访原因/死亡原因';
  }

  /* 慢阻肺随访表：转诊联动（转诊时开放原因/机构/科室） */
  function cfReferralChange() {
    var go = document.querySelector('input[name="cfReferral"]:checked').value === '转诊';
    var boxes = document.querySelectorAll('input[name="cfReferralReason"]');
    for (var i = 0; i < boxes.length; i++) {
      boxes[i].disabled = !go;
      if (!go) boxes[i].checked = false;
    }
    $('cfReferralOrg').disabled = !go;
    $('cfReferralDept').disabled = !go;
    if (!go) { $('cfReferralOrg').value = ''; $('cfReferralDept').value = ''; }
  }

  /* 慢阻肺随访表：BMI 自动计算 */
  function cfCalcBmi() {
    var h = parseFloat($('cfHeight').value);
    var w = parseFloat($('cfWeight').value);
    $('cfBmi').value = (h > 0 && w > 0) ? (w / ((h / 100) * (h / 100))).toFixed(1) : '';
  }

  /* 慢阻肺随访表：FEV1/FVC 自动计算 */
  function cfCalcFev1Fvc() {
    var f1 = parseFloat($('cfFev1').value);
    var fv = parseFloat($('cfFvc').value);
    $('cfFev1Fvc').value = (f1 > 0 && fv > 0) ? ((f1 / fv) * 100).toFixed(1) : '';
  }

  /* 慢阻肺随访表：用药行添加（⊕ 克隆当前行追加，按钮变 － 可移除） */
  function addCfMedRow(el) {
    var row = el.closest('.hp-row');
    var clone = row.cloneNode(true);
    var sels = clone.querySelectorAll('select');
    for (var i = 0; i < sels.length; i++) sels[i].selectedIndex = 0;
    var inputs = clone.querySelectorAll('input');
    for (var j = 0; j < inputs.length; j++) inputs[j].value = '';
    var add = clone.querySelector('.med-add');
    add.textContent = '－';
    add.title = '移除该条用药';
    add.onclick = function () { clone.parentNode.removeChild(clone); };
    row.parentNode.insertBefore(clone, row.nextSibling);
  }

  /* ================= 慢阻肺专项表：危险因素/确诊依据互斥（勾"无"清其他） ================= */
  function bindCopdMutex(boxId, inputName) {
    $(boxId).addEventListener('change', function (e) {
      var t = e.target;
      if (t.type !== 'checkbox' || t.name !== inputName) return;
      var boxes = $(boxId).querySelectorAll('input[type="checkbox"]');
      if (t.value === '无' && t.checked) {
        boxes.forEach(function (b) { if (b !== t) b.checked = false; });
      } else if (t.value !== '无' && t.checked) {
        boxes.forEach(function (b) { if (b.value === '无') b.checked = false; });
      }
    });
  }

  /* ================= 随访表：用药情况动态添加行 ================= */
  function addMedRow() {
    var box = $('fuMedBox');
    var row = document.createElement('div');
    row.className = 'med-row';
    row.innerHTML = '<select class="ctl"><option value="">药物名称</option><option>氨氯地平</option><option>缬沙坦</option><option>硝苯地平</option><option>美托洛尔</option></select>' +
      '<input class="ctl" placeholder="商品名">' +
      '<select class="ctl"><option value="">分类</option><option>钙通道阻滞剂</option><option>ACEI</option><option>ARB</option><option>β受体阻滞剂</option></select>' +
      '<div style="display:flex;gap:6px;align-items:center">' +
        '<select class="ctl" style="flex:1"><option value="">用法</option><option>口服</option><option>注射</option></select>' +
        '<input class="ctl" style="width:70px" placeholder="用量">' +
        '<select class="ctl" style="width:70px"><option>次/日</option><option>次/周</option></select>' +
        '<div class="med-del" onclick="this.closest(\'.med-row\').remove()" title="删除">' +
          '<svg viewBox="0 0 24 24" width="14" height="14" fill="none"><path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2m2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>' +
        '</div>' +
      '</div>';
    box.insertBefore(row, box.querySelector('.med-add') || box.lastChild);
  }

  /* ================= 随访表：随访状态切换（非正常选项二次确认 + 表单禁填） ================= */
  var fuLocked = false;

  /* 失访日期/失访原因的启停与标签文案 */
  function fuSetLostFields(status) {
    var isLost = status === '失访' || status === '死亡';
    ['fuLostDate', 'fuLostReason'].forEach(function (id) {
      var el = $(id);
      el.disabled = !isLost;
      el.style.background = isLost ? '' : '#F5F6FA';
    });
    if (status === '死亡') $('fuLostLabel').textContent = '死亡日期';
    else if (status === '失访') $('fuLostLabel').textContent = '失访日期';
    else $('fuLostLabel').textContent = '失访日期/死亡日期';
  }

  function toggleFuLost() {
    var status = $('fuStatus').value;
    var abnormal = status === '失访' || status === '死亡';
    if (abnormal) {
      if (!fuLocked) { $('fuConfirmMask').classList.add('show'); return; }
      fuSetLostFields(status); /* 已锁定状态下的失访/死亡切换，仅更新标签与失访字段 */
    } else {
      if (fuLocked) {
        fuUnlockForm();
        toast('随访状态已恢复正常，表单恢复可填写', 'info');
      }
      fuSetLostFields('正常');
    }
  }

  /* 禁填白名单：随访日期、随访方式、随访医生签名、随访状态、失访日期/死亡日期、失访/死亡原因、随访类别、随访季度 */
  function fuLockForm() {
    var allow = { fuDate: 1, fuStatus: 1, fuLostDate: 1, fuLostReason: 1, fuDoctor: 1, fuType: 1, fuQuarter: 1 };
    $('viewFollowup').querySelectorAll('input,select,textarea').forEach(function (el) {
      if ((el.id && allow[el.id]) || el.name === 'fuWay') return;
      el.disabled = true;
    });
    var add = $('viewFollowup').querySelector('.med-add');
    if (add) add.classList.add('disabled');
  }

  function fuUnlockForm() {
    fuLocked = false;
    $('viewFollowup').querySelectorAll('input,select,textarea').forEach(function (el) { el.disabled = false; });
    var add = $('viewFollowup').querySelector('.med-add');
    if (add) add.classList.remove('disabled');
  }

  function fuConfirmOk() {
    $('fuConfirmMask').classList.remove('show');
    fuLocked = true;
    fuLockForm();
    fuSetLostFields($('fuStatus').value);
    toast('已锁定表单：除随访日期、随访方式、随访医生签名及失访信息外，其余内容不可填写', 'info');
  }

  function fuConfirmCancel() {
    $('fuConfirmMask').classList.remove('show');
    $('fuStatus').value = '正常';
    fuSetLostFields('正常');
  }

  /* ================= 评估表：病史「是」联动病种 + 公卫规范自动判定 ================= */
  function asRadioVal(name) {
    var el = document.querySelector('#viewAssessment input[name="' + name + '"]:checked');
    return el ? el.value : '';
  }

  /* 病史行：选「是」显示并启用病种（复选组/输入框），否则隐藏、禁用并清空 */
  function asToggleDz(name) {
    var is = asRadioVal(name) === '是';
    var map = {
      asBrain: 'asBrainDzBox', asHeart: 'asHeartDzBox', asKidney: 'asKidneyDzBox',
      asVessel: 'asVesselDzBox', asRetina: 'asRetinaDzBox', asOther: 'asOtherDesc'
    };
    var target = $(map[name]);
    if (!target) return;
    var wrap = target.parentElement;
    if (wrap && wrap.classList.contains('ig')) wrap.style.display = is ? '' : 'none';
    if (target.tagName === 'INPUT') {
      target.disabled = !is;
      if (!is) target.value = '';
    } else {
      target.querySelectorAll('input').forEach(function (el) {
        el.disabled = !is;
        if (!is) el.checked = false;
      });
    }
  }

  /* 血压分级：1级 SBP140-159/DBP90-99；2级 SBP160-179/DBP100-109；3级 SBP≥180/DBP≥110；0=正常范围 */
  function asJudgeGrade() {
    var sbp = parseInt($('asSbp').value, 10) || 0;
    var dbp = parseInt($('asDbp').value, 10) || 0;
    if (!sbp && !dbp) return null;
    if (sbp >= 180 || dbp >= 110) return 3;
    if (sbp >= 160 || dbp >= 100) return 2;
    if (sbp >= 140 || dbp >= 90) return 1;
    return 0;
  }

  /* 公卫规范自动判定：血压分级 → 危险分层 → 分层管理 */
  function asAutoJudge(silent) {
    var grade = asJudgeGrade();
    var gradeText = grade === 3 ? '三级高血压' : grade === 2 ? '二级高血压' : grade === 1 ? '一级高血压' : '';
    ['一级高血压', '二级高血压', '三级高血压'].forEach(function (v) {
      var el = document.querySelector('#viewAssessment input[name="asBpGrade"][value="' + v + '"]');
      el.checked = (gradeText === v);
    });

    var rf = parseInt($('asRiskFactors').value, 10);
    if (isNaN(rf)) rf = 0;
    var od = $('asOrganDamage').value !== '' && $('asOrganDamage').value !== '无';
    var clinical = ['asDiabetes', 'asBrain', 'asHeart', 'asKidney', 'asVessel', 'asRetina', 'asOther'].some(function (n) {
      return asRadioVal(n) === '是';
    });

    var risk = null;
    if (clinical) risk = '极高危';
    else if (grade === null || grade === 0) risk = null;
    else if (od || rf >= 3) risk = '高危';
    else if (rf >= 1) risk = (grade === 3) ? '高危' : '中危';
    else risk = (grade === 3) ? '高危' : (grade === 2 ? '中危' : '低危');
    ['低危', '中危', '高危', '极高危'].forEach(function (v) {
      var el = document.querySelector('#viewAssessment input[name="asRisk"][value="' + v + '"]');
      el.checked = (risk === v);
    });

    var manage = risk === '低危' ? '一级管理' : risk === '中危' ? '二级管理' : (risk === '高危' || risk === '极高危') ? '三级管理' : null;
    ['一级管理', '二级管理', '三级管理'].forEach(function (v) {
      var el = document.querySelector('#viewAssessment input[name="asManage"][value="' + v + '"]');
      el.checked = (manage === v);
    });

    if (!silent) {
      if (grade === 0) toast('血压在正常范围，不判定高血压分级', 'info');
      else if (gradeText) toast('已按公卫规范自动判定：' + gradeText + (risk ? '，' + risk + '，' + manage : '') + '（如需调整请先填写血压）', 'success');
      else if (clinical) toast('已按公卫规范自动判定：' + risk + '，' + manage, 'success');
    }
  }

  function bindAssessment() {
    /* 病史行初始状态：病种默认隐藏（radio=否） */
    ['asBrain', 'asHeart', 'asKidney', 'asVessel', 'asRetina', 'asOther'].forEach(asToggleDz);

    /* 血压输入、危险因素、靶器官损害 → 自动判定 */
    ['asSbp', 'asDbp'].forEach(function (id) { $(id).addEventListener('input', function () { asAutoJudge(); }); });
    $('asRiskFactors').addEventListener('change', function () { asAutoJudge(); });
    $('asOrganDamage').addEventListener('change', function () { asAutoJudge(); });

    /* 病史单选：病种联动 + 自动判定（并存临床情况影响危险分层） */
    ['asDiabetes', 'asBrain', 'asHeart', 'asKidney', 'asVessel', 'asRetina', 'asOther'].forEach(function (n) {
      document.querySelectorAll('#viewAssessment input[name="' + n + '"]').forEach(function (r) {
        r.addEventListener('change', function () {
          if (n === 'asDiabetes') {
            var is = asRadioVal('asDiabetes') === '是';
            $('asBloodSugar').disabled = !is;
            if (!is) $('asBloodSugar').value = '';
          }
          asToggleDz(n);
          if (asRadioVal(n) === '是') toast('请选择具体病种', 'info');
          asAutoJudge();
        });
      });
    });
  }

  /* ================= 封面「下一步」 ================= */
  function coverNext() {
    var missing = [];
    if (!$('cvName').value.trim()) missing.push('姓名');
    if (!$('cvP5').value) missing.push('现住址（需选到村/居社区）');
    if (!$('cvGrid').value) missing.push('管辖网格');
    if (!$('cvAddrDetail').value.trim()) missing.push('住址详细地址');
    if (!$('cvH5').value) missing.push('户籍地址（需选到村/居社区）');
    if (!$('cvHAddrDetail').value.trim()) missing.push('户籍详细地址');
    if (!$('cvPhone').value.trim()) missing.push('联系电话');
    if (!$('cvTown').value) missing.push('乡镇（街道）名称');
    if (!$('cvVillage').value) missing.push('村（居）委会名称');
    if (!$('cvOrg').value) missing.push('建档单位');
    if (!$('cvCreator').value) missing.push('建档人');
    if (!$('cvDoctor').value) missing.push('责任医生');
    if (!$('cvDate').value) missing.push('建档日期');
    if (missing.length) { toast('请完善封面必填项：' + missing.join('、'), 'warning'); return; }

    /* 封面数据回填基本信息表，保持两视图一致 */
    $('biName').value = $('cvName').value.trim();
    $('biPhone').value = $('cvPhone').value.trim();
    $('biOrgShow').value = $('cvOrg').value;
    $('bhOrg').textContent = $('cvOrg').value;
    $('biCreateDate').value = $('cvDate').value;
    var cvPRegion = [1, 2, 3, 4, 5].map(function (i) { return $('cvP' + i).value; }).join('');
    var cvHRegion = [1, 2, 3, 4, 5].map(function (i) { return $('cvH' + i).value; }).join('');
    $('biLiveAddr').textContent = cvPRegion + $('cvAddrDetail').value;
    $('biRegAddr').textContent = '户籍地址：' + cvHRegion + $('cvHAddrDetail').value;
    /* 村委会随封面现住址带出（下拉无对应项时动态补充） */
    var vv = $('cvVillage').value;
    if (vv && !$('biVillage').querySelector('option[value="' + vv + '"]')) {
      var vOpt = document.createElement('option');
      vOpt.value = vv;
      vOpt.textContent = vv;
      $('biVillage').appendChild(vOpt);
    }
    $('biVillage').value = vv;

    switchView('basic');
    renderPatientBar();
    toast('封面信息已暂存，请继续填写个人基本信息表', 'success');
  }
  /* ================= 保存（图5：完整度 100%） ================= */
  function saveArchive() {
    if (saved) { toast('档案已是最新保存状态，无需重复保存', 'info'); return; }
    var missing = [];
    if (!$('biName').value.trim()) missing.push('姓名');
    if (!$('biIdcard').value.trim()) missing.push('证件号');
    if (!$('biBirth').value) missing.push('出生日期');
    if (missing.length) { toast('请完善必填项：' + missing.join('、'), 'warning'); return; }
    saved = true;
    $('basicCard').classList.add('saved');
    renderComplete();
    renderPatientBar();
    toast('保存成功：个人基本信息表已归档，完整度 100%', 'success');
  }

  /* ================= 返回 ================= */
  function goBack() {
    if (history.length > 1) history.back();
    else location.href = '居民档案列表.html';
  }

  /* ================= 编辑/查看进入：自动模拟专项内容 + 补全目录 ================= */
  function setVal(id, v){ var el=document.getElementById(id); if(!el) return;
    var t=el.tagName;
    if(t==='TD'||t==='SPAN'||t==='DIV'||t==='P'){ el.textContent=v; } else { el.value=v; } }
  function pickSel(id){ var el=document.getElementById(id); if(el && el.options && el.options.length) el.selectedIndex = Math.min(1, el.options.length-1); }
  function setRadio(name, v){ var el=document.querySelector('input[name="'+name+'"][value="'+v+'"]'); if(el){ el.checked=true; } }
  function setChkFirst(boxId, nth){ var b=document.getElementById(boxId); if(!b) return; var c=b.querySelectorAll('input[type=checkbox],input[type=radio]'); if(c.length) c[Math.min(nth||0, c.length-1)].checked=true; }
  function setChkByValue(name, v){ var el=document.querySelector('input[name="'+name+'"][value="'+v+'"]'); if(el) el.checked=true; }
  function todaySafe(){ try { return todayStr(); } catch(e){ var d=new Date(); return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2); } }

  function mockDiabetes(){
    pickSel('dmType'); pickSel('dmDiagOrg'); pickSel('dmSource'); pickSel('dmCreateOrg'); pickSel('dmCreateDoc');
    setVal('dmDiagDate','2023-05-12');
    setVal('dmHeight','172'); setVal('dmWeight','76'); if(typeof calcDmBmi==='function') calcDmBmi();
    setVal('dmFbg','7.8'); setVal('dmRbg','11.2'); setVal('dmPbg','13.5'); if(typeof autoDmGrade==='function') autoDmGrade();
    setVal('dmCreateDate', todaySafe());
    setRadio('dmOralDrug','否');
  }
  function mockCopd(){
    setVal('copdHeight','170'); setVal('copdWeight','62');
    setVal('copdSbp','132'); setVal('copdDbp','84');
    setChkFirst('copdRiskBox',1); setChkFirst('copdBasisBox',0);
    pickSel('copdDiagOrg'); pickSel('copdCreateOrg');
    setVal('copdDiagDate','2022-09-10'); setVal('copdCreateDate', todaySafe());
    setRadio('copdGrade','GOLD2');
  }
  function mockHyperlipidemia(){
    setVal('hlpHeight','168'); setVal('hlpWeight','72'); if (typeof hlpCalcBmi === 'function') hlpCalcBmi();
    setVal('hlpTg','2.6'); setVal('hlpTc','6.2'); setVal('hlpHdl','0.9'); setVal('hlpLdl','4.1');
    pickSel('hlpCategory');
    setRadio('hlpGrade','中度');
    setRadio('hlpDrug','是'); if (typeof hlpDrugChange === 'function') hlpDrugChange();
    setVal('hlpDrugFee','180');
    setRadio('hlpEdu','是');
    setRadio('hlpDiet','控制不够');
    setRadio('hlpDietReason','不懂方法');
    setChkByValue('hlpComp','脂肪肝'); setChkByValue('hlpComp','糖尿病');
    pickSel('hlpOrg'); pickSel('hlpDoctor');
    setVal('hlpCreateDate', todaySafe());
  }
  function mockCardio(){
    setVal('caHeight','172'); setVal('caWeight','80'); if(typeof caCalcBmi==='function') caCalcBmi();
    setVal('caSbp1','148'); setVal('caDbp1','94'); setVal('caSbp2','145'); setVal('caDbp2','92');
    setVal('caTc','5.9'); setVal('caTg','2.3'); setVal('caLdl','3.7'); setVal('caHdl','1.0');
    setVal('caAssessDate', todaySafe()); pickSel('caAssessOrg');
    setVal('caRefDate', todaySafe()); pickSel('caRefOrg'); pickSel('caRefDept'); setVal('caRefConclusion','建议转诊至上级医院进一步评估心脑血管风险。');
  }
  function mockTumor(){
    pickSel('tmMorphCode'); pickSel('tmTopoCode'); pickSel('tmIcd10');
    setVal('tmMorphName','肺腺癌'); setVal('tmTopoName','肺'); setVal('tmDiagName','肺恶性肿瘤');
    setVal('tmReportNo','R20240001'); setVal('tmContact','张医生'); setVal('tmContactTel','0514-86880000');
    setVal('tmOutpatient','呼吸内科门诊'); setVal('tmHospitalNo','ZY000123'); setVal('tmPathologyNo','BL000456');
    setRadio('tmSmoke','目前仍吸烟'); if(typeof tmSmokeChange==='function') tmSmokeChange();
    setVal('tmSmokeStartAge','20'); setVal('tmSmokeYears','30'); setVal('tmCigsPerDay','20');
    var tnmUnk=document.getElementById('tmTnmUnknown'); if(tnmUnk) tnmUnk.checked=false; if(typeof tmTnmChange==='function') tmTnmChange();
    setVal('tmTnmT','T2'); setVal('tmTnmN','N1'); setVal('tmTnmM','M0');
    pickSel('tmGrad'); pickSel('tmBasis');
    setVal('tmFirstSymDate','2023-01-10'); setVal('tmFirstDiagDate','2023-02-01'); setVal('tmDiagDate','2023-02-05');
    pickSel('tmFirstTreat'); setVal('tmSurgHosp1','山东大学齐鲁医院'); setVal('tmFirstSurgDate','2023-03-12'); pickSel('tmFirstSurgType');
    setVal('tmCommunityDoctor','李雷'); setVal('tmChemoTimes','4'); pickSel('tmPastTreat');
    setVal('tmKps','80'); pickSel('tmReportOrg'); pickSel('tmReporter'); setVal('tmReportDate', todaySafe());
    pickSel('tmCreateOrg'); setVal('tmCreator','王芳'); setVal('tmCreateDate', todaySafe());
  }
  function mockHr(){
    setVal('hrHeight','172'); setVal('hrWeight','78'); setVal('hrWaist','92'); if(typeof hrCalcBmi==='function') hrCalcBmi();
    setVal('hrFbg','6.2'); setVal('hrSbp','148'); setVal('hrDbp','94');
    setChkFirst('hrTypeBox',0);
    pickSel('hrDataSource'); pickSel('hrOrg'); pickSel('hrCheckType'); setVal('hrFollowDate', todaySafe());
  }
  function mockPsi(){
    setVal('psi1Guardian','王强'); pickSel('psi1Relation'); setVal('psi1GuardAddr','济南市历下区文化东路12号'); setVal('psi1GuardPhone','13800001111');
    setVal('psi1Contact','王强'); setVal('psi1ContactPhone','13800001111');
    setVal('psi1Sign','李华'); setVal('psi1SignDate', todaySafe()); setVal('psi1FirstDate','2019-05-20');
    setChkFirst('psi1SymptomBox',0);
    setVal('psi1FirstTreat','2020-03-10'); setRadio('psi1Hosp','综合医院精神专科'); setVal('psi1HospTimes','3');
    pickSel('psi1Diagnosis'); setVal('psi1DiagOrg','山东大学齐鲁医院'); setVal('psi1DiagDate','2020-03-12');
    setVal('psi1Opinion','病情稳定，规律服药，社会功能良好，无自伤自杀风险。'); var op=document.getElementById('psi1Opinion'); if(op) op.dispatchEvent(new Event('input'));
    pickSel('psi1Doctor'); setVal('psi1FillDate', todaySafe());
  }
  function mockTb(){
    setVal('tb1Date', todaySafe()); setRadio('tb1Way','门诊'); setRadio('tb1Cure','初治'); setRadio('tb1Quit','未吸烟');
    setChkFirst('tb1SymptomBox',0);
    setVal('tb1Plan','按方案2HRZE/4HR督导服药');
    setRadio('tb1Usage','每日'); setVal('tb1Smoke','0'); setVal('tb1SmokeTarget','0'); setVal('tb1Wine','0'); setVal('tb1WineTarget','0');
    pickSel('tb1Adverse'); setVal('tb1DrugPlace','山东大学齐鲁医院药房');
    setRadio('tb1Supervise','医生'); setRadio('tb1Bedroom','无'); setRadio('tb1Vent','良好');
    ['tb1Edu1','tb1Edu2','tb1Edu3','tb1Edu4','tb1Edu5','tb1Edu6','tb1Edu7','tb1Edu8'].forEach(function(n){ setRadio(n,'处理'); });
    setVal('tb1Next','2026-10-20'); pickSel('tb1Doctor');
  }

  function mockHealthEdu(){
    setVal('heDate', todaySafe());
    pickSel('heWay'); pickSel('hePlace'); pickSel('heOrg'); pickSel('heDoctor');
    var box = document.getElementById('heRx');
    if (box) {
      box.innerHTML = '<h3>健康教育处方</h3>' +
        '<p>一、饮食：低盐低脂饮食，每日食盐摄入量不超过 5g，少吃动物内脏、油炸食品，多吃新鲜蔬菜和水果。</p>' +
        '<p>二、运动：每周至少 150 分钟中等强度有氧运动（快走、慢跑、太极拳等），运动时心率控制在（170-年龄）次/分以内。</p>' +
        '<p>三、用药：遵医嘱规律服用降脂药物，不可自行停药或减量，注意观察有无肌肉酸痛、乏力等不适。</p>' +
        '<p>四、监测：每 3 个月复查血脂四项，每 6 个月复查肝肾功能，如出现胸痛、肢体麻木等及时就诊。</p>';
    }
    var adv = document.getElementById('heAdvice');
    if (adv) { adv.value = '本例患者为高血脂合并高血压，建议控制体重、坚持低脂饮食并规律运动；1 个月后复查血脂四项，如出现肌肉酸痛等不适及时就诊。'; heCnt(adv, 'heAdviceCnt'); }
    var rk = document.getElementById('heRemark');
    if (rk) { rk.value = '已发放《高血压防治知识手册》1 份，患者及家属共同接受健康教育。'; heCnt(rk, 'heRemarkCnt'); }
  }

  /* ================= 妇女管理：模拟填报（?edit=1） ================= */
  function mockWomanArchive() {
    setVal('waName', P.name);
    setRadio('waGender', (P.gender || '').indexOf('男') === 0 ? '男性' : '女性');
    setVal('waIdType', '居民身份证');
    setVal('waIdcard', QS.get('idcard') || P.idcard);
    setVal('waBirth', QS.get('birth') || P.birth);
    setVal('waNation', P.nation);
    setVal('waPhone', QS.get('phone') || P.phone);
    setVal('waMarriage', '已婚');
    setVal('waEdu', '中等专业学校');
    setVal('waJob', '国家机关、党群组织、企业、事业单位负责人');
    setVal('waRegAddr', '江苏省/扬州市/江都区/樊川镇/三周村');
    setVal('waRegNo', '马家组');
    setVal('waLiveAddr', '江苏省/扬州市/江都区/樊川镇/三周村');
    setVal('waLiveNo', '马家组');
    setRadio('waFee', '城镇居民基本医疗保险');
    setRadio('waResType', '农村居民');
    setRadio('waStayType', '户籍');
    setVal('waSpouseName', '张喜喜');
    setVal('waSpouseId', '510623198706031220');
    setVal('waSpousePhone', '15598989898');
    setVal('waMenarche', '14');
    setVal('waPeriod', '5');
    setVal('waCycle', '28');
    setRadio('waDysmenorrhea', '无');
    setVal('waHeight', '160');
    setVal('waWeight', '55');
    setVal('waSbp', '112');
    setVal('waDbp', '72');
    pickSel('waManageOrg');
    setSelIf('waDoctor', '李正琴');
    pickSel('waCreateOrg');
    setVal('waCreateDate', todaySafe());
    wmSetTxt('waNameTxt', P.name);
  }
  function mockPreMarital() {
    wmFillIdentity('pm', '江苏省扬州市江都区武坚镇闸西社区0000');
    setVal('pmCoupleNo', 'HY20260921001');
    setRadio('pmConsult', '是');
    setRadio('pmHbsag', '阴性');
    setRadio('pmHiv', '未见异常');
    setRadio('pmSyphilis', '未见异常');
    setVal('pmBloodNo', 'X2026092101');
    setRadio('pmPregnant', '否');
    setRadio('pmCbc', '阴性'); setVal('pmCbcDate', '2026-09-18');
    setRadio('pmHbEp', '阴性'); setVal('pmHbEpDate', '2026-09-18');
    setVal('pmThalFamily', '无');
    setVal('pmScreenPos', '未检出');
    setVal('pmSplitA', '未检出');
    setVal('pmSplitB', '未检出');
    setVal('pmSplitMix', '未检出');
    setVal('pmGeneDate', '2026-09-18');
    setRadio('pmPrenatal', '未见异常'); setVal('pmPrenatalDate', '2026-09-19');
    setVal('pmDisease', '未见异常');
    setRadio('pmAbnormal', '未见异常');
    setVal('pmCertNo', 'HYS2026092100123');
    setVal('pmAdvice', '未发现医学上不宜结婚的情形，建议适龄生育');
    setVal('pmHygieneGuide', '已开展婚前卫生指导');
    setVal('pmHygieneConsult', '已开展婚前卫生咨询');
    setVal('pmRemark', '已告知双方婚前医学检查结果，双方知情并签字。'); wmCnt($('pmRemark'), 'pmRemarkCnt');
    pickSel('pmOrg'); pickSel('pmDoctor');
    setVal('pmExamDate', todaySafe());
  }
  function mockFolicAcid() {
    setVal('faHeight', '160');
    setVal('faWeight', '55');
    faCalcBmi();
    setRadio('faHighRisk', '否');
    setVal('faQty', '3');
    setVal('faUsage', '每日一次');
    setVal('faDose', '1');
    setVal('faDoseFreq', '每日一次');
    setVal('faRemark', '已进行叶酸服用指导，嘱孕前 3 个月开始服用，共发放 3 瓶。'); wmCnt($('faRemark'), 'faRemarkCnt');
    pickSel('faOrg'); pickSel('faDoctor');
    setVal('faDate', todaySafe());
  }
  function mockPrePregnancy() {
    setVal('ppgNo', 'YQ20260921001');
    setVal('ppgDate', todaySafe());
    setVal('ppgMaleName', '张喜喜');
    setVal('ppgMaleNo', 'YQ20260921002');
    wmFillIdentity('ppg', '江苏省扬州市江都区武坚镇闸西社区0000');
    setVal('ppgHeight', '160');
    setVal('ppgWeight', '55');
    setVal('ppgEducation', '本科');
    setVal('ppgWorkUnit', '扬州市江都区实验小学');
    setChkByName('ppgPastDis', '无');
    setRadio('ppgOperation', '否');
    setChkByName('ppgNowDis', '无');
    setRadio('ppgSmoke', '无');
    setRadio('ppgPassiveSmoke', '无');
    setRadio('ppgDrink', '无');
    setVal('ppgMenarche', '14');
    setVal('ppgCycle', '28');
    setVal('ppgDuration', '5');
    setRadio('ppgFlow', '中');
    setRadio('ppgDysmenorrhea', '无');
    setVal('ppgLastPeriod', '2026-09-05');
    setChkByName('ppgBirth', '无');
    setChkByName('ppgHeredity', '无');
    pickSel('ppgRelation');
    setRadio('ppgRelativeMarriage', '否');
    setChkByName('ppgKinship', '无');
    setChkByName('ppgVaccine', '无');
    setChkByName('ppgHazard', '无');
    setRadio('ppgPicky', '无');
    setRadio('ppgVegetable', '每餐均有');
    setRadio('ppgFruit', '每天一次以上');
    setVal('ppgMeat', '150');
    setRadio('ppgMedicine', '无');
    setRadio('ppgFolic', '有');
    setVal('ppgSport', '散步、瑜伽');
    setRadio('ppgSportState', '每天运动(劳动)');
    setRadio('ppgSportLevel', '一般');
    setRadio('ppgSportTime', '半小时-1小时');
    setRadio('ppgColleague', '和睦');
    setRadio('ppgFamily', '和睦');
    setRadio('ppgFriend', '和睦');
    setRadio('ppgReady', '是');
    setRadio('ppgPressure', '有一定压力');
    setVal('ppgSbp', '112');
    setVal('ppgDbp', '72');
    setRadio('ppgMental', '正常');
    setRadio('ppgIntelligence', '正常');
    setRadio('ppgFacial', '正常');
    setRadio('ppgPosture', '正常');
    setRadio('ppgFace', '无');
    setRadio('ppgSkin', '正常');
    setRadio('ppgThyroid', '正常');
    setVal('ppgHeartRate', '76');
    setVal('ppgHeartRhythm', '齐');
    setRadio('ppgMurmur', '无');
    setRadio('ppgLung', '正常');
    setRadio('ppgLiver', '未及');
    setRadio('ppgLimb', '正常');
    setVal('ppgOther', '未见异常');
    setVal('ppgExamSign', '吕雪');
    setRadio('ppgPubicHair', '正常');
    setRadio('ppgBreast', '正常');
    setVal('ppgVulva1', '未见异常');
    setVal('ppgSecretion', '未见异常');
    setVal('ppgUterus1', '未见异常');
    setVal('ppgAdnexa1', '未见异常');
    setVal('ppgVulva2', '未见异常');
    setVal('ppgVagina', '未见异常');
    setVal('ppgCervix', '光滑');
    setVal('ppgUterus2', '未见异常');
    setVal('ppgAdnexa2', '未见异常');
    setVal('ppgSelfSign', P.name);
    setVal('ppgDoctorSign', '吕雪');
    setVal('ppgBodyOther', '无');
    setVal('ppgAssistResult', '血常规、尿常规、肝肾功能、甲状腺功能未见异常；TORCH 筛查阴性。');
    wmCnt($('ppgAssistResult'), 'ppgAssistCnt');
    setVal('ppgSpecialResult', '妇科B超未见明显异常；乳腺彩超未见明显异常。');
    wmCnt($('ppgSpecialResult'), 'ppgSpecialCnt');
    ['孕前 3 个月起每日补充叶酸 0.4mg，避免接触放射线及有害物质。',
     '规律作息、均衡膳食，控制体重在适宜范围（BMI 18.5-23.9）。',
     '戒烟戒酒、避免被动吸烟，远离宠物粪便及生肉。',
     '建议 1 个月后复查，如月经推迟及时就诊确认妊娠。'
    ].forEach(function (t, i) {
      var el = $('ppgGuide' + (i + 1));
      if (el) { el.value = t; wmCnt(el, 'ppgGuide' + (i + 1) + 'Cnt'); }
    });
    setRadio('ppgRecheck', '否');
    pickSel('ppgDoctor');
  }
  function mockWomanDisease() {
    wmFillIdentity('wd', '江苏省扬州市江都区武坚镇闸西社区0000');
    setVal('wdMarryAge', '24');
    setVal('wdFullTerm', '1');
    setVal('wdPreterm', '0');
    setVal('wdInduced', '0');
    setVal('wdNoBirth', '0');
    setVal('wdAbortion', '0');
    setVal('wdNoChild', '0');
    setVal('wdMenarche', '14');
    setRadio('wdCycleRule', '规则');
    setRadio('wdPeriod', '中');
    setRadio('wdDysmenorrhea', '无');
    setVal('wdLastPeriod', '2026-09-05');
    setRadio('wdContraception', '避孕套');
    setRadio('wdLeucorrhea', '无');
    setRadio('wdContactBleed', '无');
    setRadio('wdIrregularBleed', '无');
    setRadio('wdMyoma', '无');
    setRadio('wdOvarianCancer', '无');
    setRadio('wdIncontinence', '无');
    setVal('wdHistoryOther', '无');
    setRadio('wdHysterectomy', '无');
    setRadio('wdAdnexectomy', '无');
    setRadio('wdBreastSurgery', '无');
    setRadio('wdFamCervical', '无');
    setRadio('wdFamOvarian', '无');
    setRadio('wdFamBreast', '无');
    setVal('wdFamOther', '无');
    setVal('wdSurveyNo', 'PC20260921001');
    setChkByName('wdVulva', '正常');
    setChkByName('wdVagina', '正常');
    setChkByName('wdCervix', '正常');
    setRadio('wdErosion', '无');
    setRadio('wdProlapse', '旧');
    setChkByName('wdUterusBody', '正常');
    setChkByName('wdAdnexa', '正常');
    setChkByName('wdLeucorrheaRoutine', '清洁度');
    setRadio('wdVaginitisTreat', '无');
    setRadio('wdBUltrasound', '未见异常');
    pickSel('wdGynDoctor');
    setRadio('wdPapanicolaou', 'Ⅱ');
    setRadio('wdTbs', 'NILM');
    pickSel('wdCytoDoctor');
    setRadio('wdColposcopyResult', '阴性');
    pickSel('wdColposcopyDoctor');
    pickSel('wdColposcopyOrg');
    setRadio('wdPathology', '阴性');
    pickSel('wdPathologyDoctor');
    pickSel('wdPathologyOrg');
    setRadio('wdCervicalTreat', '无');
    setRadio('wdCervicalReferral', '否');
    setVal('wdCervicalReferralAdvice', '无需转诊，建议定期复查');
    pickSel('wdCervicalReferralOrg');
    setChkByName('wdBreastClinicLeft', '正常');
    setChkByName('wdBreastClinicRight', '正常');
    pickSel('wdBreastClinicDoctor');
    setRadio('wdBreastUsLeft', '未见异常');
    setRadio('wdBreastUsRight', '未见异常');
    pickSel('wdBreastUsOrg');
    pickSel('wdBreastUsDoctor');
    setRadio('wdBreastMammoLeft', '未见异常');
    setRadio('wdBreastMammoRight', '未见异常');
    pickSel('wdBreastMammoOrg');
    pickSel('wdBreastMammoDoctor');
    setRadio('wdBreastPathLeft', '未见异常');
    setRadio('wdBreastPathRight', '未见异常');
    pickSel('wdBreastPathOrg');
    pickSel('wdBreastPathDoctor');
    setRadio('wdBreastTreat', '药物');
    setRadio('wdBreastReferral', '否');
    pickSel('wdBreastReferralOrg');
    setRadio('wdCheckResult', '未检出妇女病');
    pickSel('wdFillOrg');
    pickSel('wdFillDoctor');
    setVal('wdFillDate', todaySafe());
  }

  /* =========================================================================
     儿童管理模块：儿童档案信息
     （儿童管理列表页「新建」弹框 → 下一步进入；列表页「查看/编辑」带参进入）
     ========================================================================= */
  /* 顶部信息栏：儿童相关视图展示儿童本人信息（证件号/出生日期/住址） */
  /* 取一组候选输入框中第一个有值的（各儿童视图字段名不同） */
  function cnFirstVal(ids) {
    for (var i = 0; i < ids.length; i++) {
      var el = document.getElementById(ids[i]);
      if (el && el.value) return el.value;
    }
    return '';
  }
  function renderChildBar() {
    var name = QS.get('name') || cnFirstVal(['chName', 'cbcName', 'cnvName']) || P.name;
    var birth = QS.get('birth') || cnFirstVal(['chBirth', 'cbcBirth', 'cnvBirth']) || P.birth;
    $('ptName').textContent = name;
    $('ptAge').textContent = wmAgeText(birth);
    $('ptIdcard').textContent = QS.get('idcard') || cnFirstVal(['chIdcard', 'cnvIdcard']) || '-';
    $('ptBirth').textContent = birth || '-';
    $('ptBlood').textContent = '-';
    $('ptPhone').textContent = '-';
    $('ptAllergy').textContent = '-';
    var addr = '';
    if (QS.get('addr')) {
      addr = QS.get('addr').replace(/\//g, '') + (QS.get('addrDetail') || '');
    } else if ($('chLiveAddr')) {
      addr = $('chLiveAddr').value.replace(/\//g, '') + ($('chDoorNo1') ? $('chDoorNo1').value : '');
    }
    if (!addr) addr = cnFirstVal(['cnvHomeAddr']);
    $('ptAddr').textContent = addr || '-';
    $('ptAddr').title = $('ptAddr').textContent;
  }

  /* 保存：校验必填 → 首次保存分配档案编号并开放「结案」*/
  function saveChildArchive() {
      var miss = wmMissing([
        { t: 'val', id: 'chName', label: '姓名' },
        { t: 'radio', name: 'chGender', label: '性别' },
      { t: 'val', id: 'chNation', label: '民族' },
      { t: 'val', id: 'chIdcard', label: '身份证号码' },
      { t: 'val', id: 'chBirth', label: '出生日期' },
      { t: 'val', id: 'chRegAddr', label: '户籍地址' },
      { t: 'val', id: 'chDoorNo1', label: '门牌号' },
      { t: 'val', id: 'chDoorNo2', label: '门牌号' },
      { t: 'val', id: 'chLiveAddr', label: '现住址' },
      { t: 'val', id: 'chGuardName', label: '监护人姓名' },
      { t: 'val', id: 'chGuardIdcard', label: '监护人身份证号' },
      { t: 'val', id: 'chGuardBirth', label: '监护人出生日期' },
      { t: 'val', id: 'chGuardPhone', label: '监护人联系电话' },
      { t: 'radio', name: 'chGuardJob', label: '监护人职业' }
    ]);
    if (miss.length) { toast('请完善必填项：' + miss.join('、'), 'warning'); return; }
    var no = $('chArchNo').textContent;
    if (!no || no === '-') { no = '32101210310300001'; $('chArchNo').textContent = no; }
    if ($('chName').value.trim()) $('chNameTxt').textContent = $('chName').value.trim();
    $('chBtnClose').style.display = '';
    renderChildBar();
    toast('保存成功：儿童档案已建立（档案编号 ' + no + '）', 'success');
  }

  function closeChildCase() {
    toast('儿童档案已结案', 'success');
  }

  /* =========================================================================
     孕产妇管理模块
       孕产妇档案 / 第1次产前服务记录表 / 产前访视（第2次产前服务记录表）
       分娩记录 / 产后访视记录表 / 产后42天健康检查记录表
     ========================================================================= */
  /* 孕产妇档案编号（设计稿值） */
  var MS_ARCH_NO = '51011500100076';
  /* 文本域字数统计 */
  function msCount(el, cntId) {
    var c = $(cntId);
    if (!c || !el) return;
    var max = el.getAttribute('maxlength') || '500';
    c.textContent = (el.value || '').length + '/' + max;
  }
  /* BMI 自动计算（身高 cm + 体重 kg → kg/m²） */
  function _msBmi(hId, wId, outId) {
    var he = $(hId), we = $(wId), out = $(outId);
    if (!he || !we || !out) return;
    var h = parseFloat(he.value), w = parseFloat(we.value);
    out.value = (h > 0 && w > 0) ? (w / Math.pow(h / 100, 2)).toFixed(2) : '';
  }
  function calcMsBmi() { _msBmi('msArcHeight', 'msArcWeight', 'msArcBmi'); }
  function calcPn1Bmi() { _msBmi('pn1Height', 'pn1Weight', 'pn1Bmi'); }
  /* 各表表头副标题（姓名 / 档案编号） */
  function msFillHead(pref, name) {
    var t = $(pref + 'NameTxt'), a = $(pref + 'ArchNo');
    if (t) t.textContent = name || P.name;
    if (a) a.textContent = MS_ARCH_NO;
  }
  /* ---------------- 孕产妇档案 ---------------- */
  function saveMsArchive() {
    var missing = wmMissing([
      { t: 'val', id: 'msArcGravida', label: '孕次' },
      { t: 'val', id: 'msArcParity', label: '产次' },
      { t: 'val', id: 'msArcChildren', label: '现有子女数' },
      { t: 'val', id: 'msArcLmp', label: '末次月经时间' },
      { t: 'val', id: 'msArcManageOrg', label: '管理机构' },
      { t: 'val', id: 'msArcDoctor', label: '责任医生' },
      { t: 'val', id: 'msArcCreateOrg', label: '建档机构' },
      { t: 'val', id: 'msArcCreateDate', label: '建档日期' }
    ]);
    if (missing.length) { toast('请完善必填项：' + missing.join('、'), 'warning'); return; }
    msFillHead('msArc');
    msMarkArchCreated();
    wmToastSaved('保存成功：孕产妇档案已建立，可继续填报产前检查、分娩记录与产后访视');
  }
  function mockMsArchive() {
    $('msArcGender').textContent = (P.gender || '').indexOf('男') === 0 ? '男' : '女';
    $('msArcIdcard').textContent = QS.get('idcard') || P.idcard;
    $('msArcAge').textContent = wmAgeText(QS.get('birth') || P.birth);
    $('msArcNation').textContent = P.nation;
    $('msArcPhone').textContent = QS.get('phone') || P.phone;
    setVal('msArcJob', '');
    setVal('msArcEdu', '');
    setVal('msArcWork', '银行');
    setVal('msArcAddr', '四川省成都市温江区柳城街道办事处北街社区1212');
    setVal('msArcHeight', ''); setVal('msArcWeight', ''); setVal('msArcBmi', '');
    setVal('msArcSpouse', ''); setVal('msArcSpouseId', ''); setVal('msArcSpousePhone', '');
    pickSel('msArcManageOrg'); pickSel('msArcDoctor'); pickSel('msArcCreateOrg');
    setVal('msArcCreateDate', todaySafe());
    msFillHead('msArc');
    msMarkArchCreated();
  }

  /* ---------------- 第1次产前服务记录表 ---------------- */
  function saveMsPrenatal1() {
    var missing = wmMissing([
      { t: 'val', id: 'pn1FillDate', label: '填表日期' },
      { t: 'val', id: 'pn1HusbandAge', label: '丈夫年龄' },
      { t: 'val', id: 'pn1HusbandPhone', label: '丈夫联系电话' },
      { t: 'val', id: 'pn1Gravida', label: '孕次' },
      { t: 'val', id: 'pn1Lmp', label: '末次月经' },
      { t: 'val', id: 'pn1Sbp', label: '收缩压' },
      { t: 'val', id: 'pn1Dbp', label: '舒张压' },
      { t: 'val', id: 'pn1NextDate', label: '下次随访日期' }
    ]);
    if (missing.length) { toast('请完善必填项：' + missing.join('、'), 'warning'); return; }
    msFillHead('pn1');
    wmToastSaved('保存成功：第1次产前服务记录已保存');
  }
  function mockMsPrenatal1() {
    setVal('pn1FillDate', '2023-04-03');
    setVal('pn1GestW', '4'); setVal('pn1GestD', '1');
    if ($('pn1Age')) $('pn1Age').textContent = wmAgeText(QS.get('birth') || P.birth);
    setVal('pn1HusbandName', '12'); setVal('pn1HusbandAge', '3'); setVal('pn1HusbandPhone', '13899119181');
    setVal('pn1Gravida', '1'); setVal('pn1DeliverVaginal', '0'); setVal('pn1DeliverCesarean', '0');
    setVal('pn1Lmp', '2023-04-01'); setVal('pn1Due', '2024-01-08');
    setChkByValue('pn1Past', '无'); setChkByValue('pn1Family', '无'); setChkByValue('pn1Personal', '无特殊');
    setRadio('pn1GynSurgery', '无');
    setVal('pn1Height', ''); setVal('pn1Weight', ''); setVal('pn1Bmi', '');
    setRadio('pn1Heart', '未见异常'); setRadio('pn1Lung', '未见异常');
    setRadio('pn1Vulva', '未见异常'); setRadio('pn1Vagina', '未见异常');
    setRadio('pn1Cervix', '未见异常'); setRadio('pn1Uterus', '未见异常'); setRadio('pn1Adnexa', '未见异常');
    setRadio('pn1Rh', '不详');
    setRadio('pn1Referral', '无');
    setVal('pn1NextDate', '2023-04-12'); pickSel('pn1Doctor');
    msFillHead('pn1');
  }

  /* ---------------- 产前访视（第2次产前服务记录表） ---------------- */
  function saveMsPrenatalVisit() {
    var missing = wmMissing([
      { t: 'val', id: 'pnvVisitNo', label: '随访次数' },
      { t: 'val', id: 'pnvVisitDate', label: '随访/督促日期' },
      { t: 'val', id: 'pnvGestW', label: '孕周' },
      { t: 'val', id: 'pnvWeight', label: '基础体重' },
      { t: 'val', id: 'pnvChief', label: '主诉' },
      { t: 'val', id: 'pnvFundus', label: '宫底高度' },
      { t: 'val', id: 'pnvAbdomen', label: '腹围' },
      { t: 'val', id: 'pnvFetalPos', label: '胎位' },
      { t: 'val', id: 'pnvFetalHr', label: '胎心率' },
      { t: 'val', id: 'pnvSbp', label: '收缩压' },
      { t: 'val', id: 'pnvDbp', label: '舒张压' },
      { t: 'val', id: 'pnvHb', label: '血红蛋白' },
      { t: 'val', id: 'pnvUrineProtein', label: '尿蛋白' },
      { t: 'radio', name: 'pnvClassify', label: '分类' },
      { t: 'chk', name: 'pnvGuide', label: '保健指导' },
      { t: 'val', id: 'pnvNextDate', label: '下次随访日期' },
      { t: 'val', id: 'pnvDoctor', label: '随访医生签名' }
    ]);
    if (missing.length) { toast('请完善必填项：' + missing.join('、'), 'warning'); return; }
    msFillHead('pnv');
    wmToastSaved('保存成功：产前访视记录已保存');
  }
  function mockMsPrenatalVisit() {
    setVal('pnvVisitNo', '2'); setVal('pnvVisitDate', '2023-04-03');
    setVal('pnvGestW', '1'); setVal('pnvGestD', '2'); setVal('pnvWeight', '12');
    setVal('pnvChief', '1'); msCount($('pnvChief'), 'pnvChiefCnt');
    setVal('pnvFundus', '12'); setVal('pnvAbdomen', '66');
    setVal('pnvFetalPos', '2'); setVal('pnvFetalHr', '88');
    setVal('pnvSbp', '12'); setVal('pnvDbp', '2');
    setVal('pnvHb', '12'); setVal('pnvUrineProtein', '3');
    setChkByValue('pnvGuide', '生活方式');
    setRadio('pnvReferral', '无');
    setVal('pnvNextDate', '2023-04-12'); pickSel('pnvDoctor');
    msFillHead('pnv');
  }

  /* ---------------- 分娩记录 ---------------- */
  function saveMsDelivery() {
    var missing = wmMissing([{ t: 'val', id: 'dlBirthTime', label: '分娩时间' }]);
    if (missing.length) { toast('请完善必填项：' + missing.join('、'), 'warning'); return; }
    msFillHead('dl');
    wmToastSaved('保存成功：分娩记录已保存');
  }
  function mockMsDelivery() {
    setVal('dlMotherName', P.name);
    setVal('dlMotherIdcard', QS.get('idcard') || P.idcard);
    setVal('dlFatherName', '32');
    setVal('dlFamilyAddr', '四川省成都市温江区北街社区柳城街道办事处1212');
    setVal('dlAdmitDate', '2023-04-03');
    setVal('dlBirthTime', '2023-04-01 00:00:00');
    setVal('dlGestW', '2'); setVal('dlGestD', '2');
    setRadio('dlFetalPos', '头部');
    setVal('dlLaborHour', '2'); setVal('dlLaborMin', '3'); setVal('dlBloodLoss', '1');
    setVal('dlSbp', '43'); setVal('dlDbp', '1');
    setVal('dlF1Name', '李航'); pickSel('dlF1Gender');
    setVal('dlF1Weight', '11'); setVal('dlF1Length', '2');
    setRadio('dlF1Outcome', '活产');
    setVal('dlF1ApgarScore', '0');
    msFillHead('dl');
  }

  /* ---------------- 产后访视记录表 ---------------- */
  function saveMsPostVisit() {
    var missing = wmMissing([
      { t: 'val', id: 'pvsVisitDate', label: '随访日期' },
      { t: 'val', id: 'pvsBirthDate', label: '分娩日期' },
      { t: 'val', id: 'pvsDischargeDate', label: '出院日期' },
      { t: 'val', id: 'pvsTemp', label: '体温' },
      { t: 'val', id: 'pvsHealth', label: '一般健康情况' },
      { t: 'val', id: 'pvsMental', label: '一般心理情况' },
      { t: 'val', id: 'pvsSbp', label: '收缩压' },
      { t: 'val', id: 'pvsDbp', label: '舒张压' },
      { t: 'radio', name: 'pvsBreast', label: '乳房' },
      { t: 'radio', name: 'pvsLochia', label: '恶露' },
      { t: 'radio', name: 'pvsUterus', label: '子宫' },
      { t: 'radio', name: 'pvsWound', label: '伤口' },
      { t: 'radio', name: 'pvsClassify', label: '分类' },
      { t: 'chk', name: 'pvsGuide', label: '指导' },
      { t: 'val', id: 'pvsNextDate', label: '下次随访日期' },
      { t: 'val', id: 'pvsDoctor', label: '随访医生签名' }
    ]);
    if (missing.length) { toast('请完善必填项：' + missing.join('、'), 'warning'); return; }
    msFillHead('pvs');
    wmToastSaved('保存成功：产后访视记录已保存');
  }
  function mockMsPostVisit() {
    setVal('pvsVisitDate', todaySafe());
    setRadio('pvsBreast', '未见异常'); setRadio('pvsLochia', '未见异常');
    setRadio('pvsUterus', '未见异常'); setRadio('pvsWound', '未见异常');
    setRadio('pvsClassify', '未见异常');
    setRadio('pvsReferral', '无');
    pickSel('pvsDoctor');
    msFillHead('pvs');
  }

  /* ---------------- 产后42天健康检查记录表 ---------------- */
  function saveMsPost42() {
    var missing = wmMissing([
      { t: 'val', id: 'p42VisitDate', label: '随访日期' },
      { t: 'val', id: 'p42BirthDate', label: '分娩日期' },
      { t: 'val', id: 'p42DischargeDate', label: '出院日期' },
      { t: 'val', id: 'p42Health', label: '一般健康情况' },
      { t: 'val', id: 'p42Mental', label: '一般心理情况' },
      { t: 'val', id: 'p42Sbp', label: '收缩压' },
      { t: 'val', id: 'p42Dbp', label: '舒张压' },
      { t: 'radio', name: 'p42Breast', label: '乳房' },
      { t: 'radio', name: 'p42Lochia', label: '恶露' },
      { t: 'radio', name: 'p42Uterus', label: '子宫' },
      { t: 'radio', name: 'p42Wound', label: '伤口' },
      { t: 'radio', name: 'p42Classify', label: '分类' },
      { t: 'chk', name: 'p42Guide', label: '指导' },
      { t: 'val', id: 'p42ReferralReason', label: '转诊原因' },
      { t: 'val', id: 'p42ReferralOrg', label: '转诊机构' },
      { t: 'val', id: 'p42ReferralDept', label: '转诊科室' },
      { t: 'val', id: 'p42Doctor', label: '随访医生签名' }
    ]);
    if (missing.length) { toast('请完善必填项：' + missing.join('、'), 'warning'); return; }
    msFillHead('p42');
    wmToastSaved('保存成功：产后42天健康检查记录已保存');
  }
  function mockMsPost42() {
    setVal('p42VisitDate', '2023-04-03');
    setVal('p42BirthDate', '2024-01-08');
    setVal('p42DischargeDate', '2023-04-01');
    setVal('p42Health', '一般健康情况'); msCount($('p42Health'), 'p42HealthCnt');
    setVal('p42Mental', '一般心理情况'); msCount($('p42Mental'), 'p42MentalCnt');
    setVal('p42Sbp', '12'); setVal('p42Dbp', '21');
    setRadio('p42Breast', '未见异常'); setRadio('p42Lochia', '未见异常');
    setRadio('p42Uterus', '未见异常'); setRadio('p42Wound', '未见异常');
    setRadio('p42Classify', '已恢复');
    setChkByValue('p42Guide', '心理保健');
    setRadio('p42Handle', '转诊');
    setVal('p42ReferralReason', '12');
    pickSel('p42ReferralOrg'); pickSel('p42ReferralDept');
    pickSel('p42Doctor');
    msFillHead('p42');
  }


  /* =========================================================================
     儿童管理：出生医学证明 / 新生儿家庭访视 / 1-8月龄·12-30月龄·3-6岁儿童健康检查
     ========================================================================= */
  /* 字典注入：民族（16 项）、职业（9 项）—— 与儿童管理弹框共用同一口径 */
  var CN_NATIONS = ['汉族', '蒙古族', '回族', '藏族', '维吾尔族', '苗族', '彝族', '壮族',
    '布依族', '朝鲜族', '满族', '侗族', '瑶族', '白族', '土家族', '其他'];
  var CN_JOBS = ['国家机关、党群组织、企业、事业单位负责人', '专业技术人员', '办事人员和有关人员',
    '商业、服务业人员', '农、林、牧、渔、水利业生产人员', '生产、运输、设备操作人员及有关人员',
    '军人', '不便分类的其他从业人员', '无职业'];
  function cnFillDict() {
    Array.prototype.forEach.call(document.querySelectorAll('select[data-nation]'), function (sel) {
      if (sel.options.length) return;
      var html = '<option value="" selected>请选择</option>';
      CN_NATIONS.forEach(function (v) { html += '<option value="' + v + '">' + v + '</option>'; });
      sel.innerHTML = html;
    });
    Array.prototype.forEach.call(document.querySelectorAll('select[data-job]'), function (sel) {
      if (sel.options.length) return;
      var html = '<option value="" selected>请选择</option>';
      CN_JOBS.forEach(function (v) { html += '<option value="' + v + '">' + v + '</option>'; });
      sel.innerHTML = html;
    });
  }

  /* 富文本（12-30月龄 · 中医健康管理服务）：execCommand 演示 */
  var CN_SIZE_SEQ = [2, 3, 4, 5], cnSizeIdx = 1;
  function cnRtf(cmd, boxId) {
    var box = $(boxId);
    if (box) box.focus();
    try {
      if (cmd === 'h3') { document.execCommand('formatBlock', false, 'h3'); return; }
      if (cmd === 'size') { document.execCommand('fontSize', false, CN_SIZE_SEQ[cnSizeIdx]); cnSizeIdx = (cnSizeIdx + 1) % CN_SIZE_SEQ.length; return; }
      if (cmd === 'font') { document.execCommand('fontName', false, '宋体'); return; }
      if (cmd === 'color') { document.execCommand('foreColor', false, '#D4380D'); return; }
      if (cmd === 'image') { toast('插入图片功能建设中', 'info'); return; }
      document.execCommand(cmd, false, null);
    } catch (e) {}
  }
  function cnFullscreen(rtId) {
    var rt = $(rtId);
    if (rt) rt.classList.toggle('he-rt-full');
  }

  /* 各儿童视图表头姓名 / 档案编号 统一回填 */
  function cnFillHead(prefix, nameId) {
    var nt = document.getElementById(prefix + 'NameTxt');
    var an = document.getElementById(prefix + 'ArchNo');
    var nm = QS.get('name') || cnFirstVal([nameId]) || P.name;
    if (nt) nt.textContent = nm;
    if (an) an.textContent = QS.get('archNo') || '-';
  }

  /* ---------- 出生医学证明 ---------- */
  function saveChildBirthCert() {
    var miss = wmMissing([
      { t: 'radio', name: 'cbcGender', label: '性别' },
      { t: 'val', id: 'cbcBirth', label: '出生日期' },
      { t: 'val', id: 'cbcGestWeek', label: '出生孕周' },
      { t: 'val', id: 'cbcLength', label: '出生身长' },
      { t: 'val', id: 'cbcBirthPlace', label: '出生地点' },
      { t: 'val', id: 'cbcMother', label: '母亲姓名' },
      { t: 'val', id: 'cbcMotherIdType', label: '证件类型' },
      { t: 'val', id: 'cbcMotherIdcard', label: '证件号' },
      { t: 'val', id: 'cbcMotherAge', label: '年龄' },
      { t: 'val', id: 'cbcMotherNation', label: '母亲民族' },
      { t: 'val', id: 'cbcMotherAddr', label: '母亲住址' },
      { t: 'val', id: 'cbcNo', label: '编号' },
      { t: 'val', id: 'cbcIssueOrg', label: '签发机构' },
      { t: 'val', id: 'cbcIssueDate', label: '签发日期' }
    ]);
    if (miss.length) { toast('请完善必填项：' + miss.join('、'), 'warning'); return; }
    if ($('cbcName').value.trim()) $('cbcNameTxt').textContent = $('cbcName').value.trim();
    renderChildBar();
    wmToastSaved('保存成功：出生医学证明已登记');
  }
  function mockChildBirthCert() {
    setVal('cbcName', '王儿童');
    setRadio('cbcGender', '男');
    setVal('cbcBirth', '2021-05-01');
    setVal('cbcBirthTime', '00:02');
    setVal('cbcGestWeek', '52');
    setVal('cbcGestDay', '4');
    setVal('cbcWeight', '200');
    setVal('cbcLength', '21');
    setVal('cbcBirthPlace', '山东大学齐鲁医院');
    setVal('cbcOrg', '山东大学齐鲁医院');
    setVal('cbcMother', '王大人');
    setVal('cbcMotherIdType', '居民身份证');
    setVal('cbcMotherIdcard', '511112120206120628');
    setVal('cbcMotherAge', '52');
    setVal('cbcMotherCountry', '中国');
    setVal('cbcMotherNation', '汉族');
    setVal('cbcMotherAddr', '江苏省/扬州市/江都区/仙女镇/龙川社区');
    setVal('cbcMotherAddrDetail', '龙川组');
    setVal('cbcFatherAddr', '江苏省/扬州市/江都区/仙女镇/龙川社区');
    setVal('cbcNo', '323434');
    setVal('cbcIssueOrg', '山东大学齐鲁医院');
    setVal('cbcIssueDate', '2023-04-03');
  }

  /* ---------- 新生儿家庭访视记录表 ---------- */
  function saveChildNewbornVisit() {
    var miss = wmMissing([
      { t: 'val', id: 'cnvGestWeek', label: '出生孕周' },
      { t: 'radio', name: 'cnvDeform', label: '畸形' },
      { t: 'val', id: 'cnvVisitDate', label: '本次随访日期' },
      { t: 'val', id: 'cnvNextDate', label: '下次随访日期' },
      { t: 'val', id: 'cnvDoctor', label: '随访医生签名' },
      { t: 'val', id: 'cnvStatus', label: '随访状态' }
    ]);
    if (miss.length) { toast('请完善必填项：' + miss.join('、'), 'warning'); return; }
    if ($('cnvName').value.trim()) $('cnvNameTxt').textContent = $('cnvName').value.trim();
    renderChildBar();
    wmToastSaved('保存成功：新生儿家庭访视记录已登记');
  }
  function mockChildNewbornVisit() {
    setVal('cnvName', '王儿童');
    setRadio('cnvGender', '男');
    setVal('cnvBirth', '2022-07-08');
    setVal('cnvHomeAddr', '江苏省扬州市江都区仙女镇龙川社区');
    setVal('cnvIdcard', '511112202207080611');
    setVal('cnvDoorNo', '龙川组');
    setVal('cnvMotherName', '王大人');
    setVal('cnvMotherJob', '国家机关、党群组织、企业、事业单位负责人');
    setVal('cnvMotherPhone', '18689996532');
    setVal('cnvMotherBirth', '1989-06-11');
    setVal('cnvGestWeek', '40');
    setVal('cnvGestDay', '2');
    setChkByValue('cnvPregDis', '无');
    setChkByValue('cnvBirthCase', '顺产');
    setRadio('cnvAsphyxia', '无');
    setRadio('cnvDeform', '无');
    setChkByValue('cnvHearing', '通过');
    setChkByValue('cnvDisScreen', '未进行');
    setVal('cnvBirthWeight', '3.2');
    setVal('cnvNowWeight', '3.5');
    setVal('cnvBirthLength', '50');
    setRadio('cnvFeed', '纯母乳喂养');
    setVal('cnvMilkVol', '80');
    setVal('cnvMilkTimes', '8');
    setRadio('cnvVomit', '无');
    setChkByValue('cnvStool', '白陶土样便');
    setVal('cnvStoolTimes', '3');
    setVal('cnvTemp', '36.5');
    setVal('cnvHeartRate', '128');
    setVal('cnvBreathRate', '38');
    setChkByValue('cnvFace', '红润');
    setChkByValue('cnvJaundice', '面部');
    setVal('cnvFontanelleW', '2.0');
    setVal('cnvFontanelleH', '2.0');
    setRadio('cnvFontanelle', '正常');
    ['cnvEye', 'cnvLimbs', 'cnvEar', 'cnvNose', 'cnvMouth', 'cnvAnus', 'cnvChest', 'cnvAbdomen', 'cnvHeartLung', 'cnvSpine', 'cnvGenital'].forEach(function (n) { setRadio(n, '未见异常'); });
    setRadio('cnvNeck', '无');
    setChkByValue('cnvSkin', '未见异常');
    setChkByValue('cnvCord', '脱落');
    setRadio('cnvReferral', '无');
    setChkByValue('cnvGuide', '喂养指导');
    setVal('cnvVisitDate', todaySafe());
    setVal('cnvDoctor', '吕雪');
    setVal('cnvStatus', '正常');
  }

  /* ---------- 1-8月龄儿童健康检查记录表 ---------- */
  function saveChildHealth18m() {
    var miss = wmMissing([
      { t: 'val', id: 'ch18Month', label: '月龄' },
      { t: 'val', id: 'ch18Date', label: '随访日期' },
      { t: 'val', id: 'ch18Weight', label: '体重' },
      { t: 'val', id: 'ch18Length', label: '身长' },
      { t: 'val', id: 'ch18Head', label: '头围' },
      { t: 'radio', name: 'ch18Skin', label: '皮肤' },
      { t: 'val', id: 'ch18Hgb', label: '血红蛋白值' },
      { t: 'chk', name: 'ch18RickSx', label: '可疑佝偻病症状' },
      { t: 'chk', name: 'ch18RickSign', label: '可疑佝偻病体征' },
      { t: 'chk', name: 'ch18Guide', label: '指导' },
      { t: 'val', id: 'ch18NextDate', label: '下次随访日期' },
      { t: 'val', id: 'ch18Doctor', label: '随访医生签名' },
      { t: 'val', id: 'ch18Status', label: '随访状态' }
    ]);
    if (miss.length) { toast('请完善必填项：' + miss.join('、'), 'warning'); return; }
    wmToastSaved('保存成功：1-8月龄儿童健康检查记录已登记');
  }
  function mockChildHealth18m() {
    setVal('ch18Month', '6月龄');
    setVal('ch18Date', todaySafe());
    setVal('ch18Weight', '8.5');
    setVal('ch18Length', '68');
    setVal('ch18Head', '43');
    setRadio('ch18WeightLv', '中');
    setRadio('ch18LengthLv', '中');
    setChkByValue('ch18Face', '红润');
    setRadio('ch18Skin', '未见异常');
    setChkByValue('ch18Fontanelle', '未闭');
    setRadio('ch18Neck', '无');
    ['ch18Eye', 'ch18Ear', 'ch18Mouth', 'ch18Chest', 'ch18Abdomen', 'ch18Limbs', 'ch18Anus', 'ch18Navel'].forEach(function (n) { setRadio(n, '未见异常'); });
    setVal('ch18Hgb', '118');
    setChkByValue('ch18RickSx', '无');
    setChkByValue('ch18RickSign', '无');
    setVal('ch18Outdoor', '2');
    setVal('ch18VitD', '400');
    setChkByValue('ch18Ill', '无');
    setRadio('ch18Referral', '无');
    setChkByValue('ch18Guide', '科学喂养');
    setVal('ch18Doctor', '吕雪');
    setVal('ch18Status', '正常');
  }

  /* ---------- 12-30月龄儿童健康检查记录表 ---------- */
  function saveChildHealth1230m() {
    var miss = wmMissing([
      { t: 'val', id: 'ch1230Month', label: '月龄' },
      { t: 'val', id: 'ch1230Date', label: '随访日期' },
      { t: 'val', id: 'ch1230Weight', label: '体重' },
      { t: 'val', id: 'ch1230Length', label: '身长' },
      { t: 'chk', name: 'ch1230Face', label: '面色' },
      { t: 'radio', name: 'ch1230Skin', label: '皮肤' },
      { t: 'radio', name: 'ch1230Ear', label: '耳外观' },
      { t: 'radio', name: 'ch1230Abdomen', label: '腹部' },
      { t: 'val', id: 'ch1230Teeth', label: '出牙数' },
      { t: 'val', id: 'ch1230Caries', label: '龋齿数' },
      { t: 'val', id: 'ch1230Outdoor', label: '户外活动' },
      { t: 'val', id: 'ch1230VitD', label: '服用维生素D' },
      { t: 'chk', name: 'ch1230Ill', label: '两次随访间患病情况' },
      { t: 'radio', name: 'ch1230Referral', label: '转诊建议' },
      { t: 'chk', name: 'ch1230Guide', label: '指导' },
      { t: 'val', id: 'ch1230NextDate', label: '下次随访日期' },
      { t: 'val', id: 'ch1230Doctor', label: '随访医生签名' },
      { t: 'val', id: 'ch1230Status', label: '随访状态' }
    ]);
    if (miss.length) { toast('请完善必填项：' + miss.join('、'), 'warning'); return; }
    wmToastSaved('保存成功：12-30月龄儿童健康检查记录已登记');
  }
  function mockChildHealth1230m() {
    setVal('ch1230Month', '12月龄');
    setVal('ch1230Date', '2023-04-03');
    setVal('ch1230Weight', '12');
    setVal('ch1230Length', '100');
    setRadio('ch1230WeightLv', '中');
    setRadio('ch1230LengthLv', '上');
    setChkByValue('ch1230Face', '红润');
    setRadio('ch1230Skin', '未见异常');
    setChkByValue('ch1230Fontanelle', '闭合');
    setRadio('ch1230Ear', '未见异常');
    setRadio('ch1230Eye', '未见异常');
    setRadio('ch1230Hearing', '通过');
    setVal('ch1230Teeth', '20');
    setVal('ch1230Caries', '20');
    setRadio('ch1230Chest', '未见异常');
    setRadio('ch1230Abdomen', '未见异常');
    setRadio('ch1230Limbs', '未见异常');
    setChkByValue('ch1230RickSign', '无');
    setVal('ch1230Outdoor', '5');
    setVal('ch1230VitD', '1');
    setChkByValue('ch1230Ill', '无');
    setRadio('ch1230Referral', '无');
    setChkByValue('ch1230Guide', '科学喂养');
    setVal('ch1230NextDate', '2023-04-29');
    setVal('ch1230Doctor', '党笑天');
    setVal('ch1230Status', '正常');
  }

  /* ---------- 3-6岁儿童健康检查记录表 ---------- */
  function saveChildHealth36y() {
    var miss = wmMissing([
      { t: 'val', id: 'ch36Age', label: '年龄' },
      { t: 'val', id: 'ch36Date', label: '随访日期' },
      { t: 'val', id: 'ch36Weight', label: '体重' },
      { t: 'val', id: 'ch36Height', label: '身长' },
      { t: 'radio', name: 'ch36WhLv', label: '体重/身高' },
      { t: 'chk', name: 'ch36GrowthEval', label: '体格发育评价' },
      { t: 'val', id: 'ch36NakedL', label: '裸眼视力（左眼）' },
      { t: 'val', id: 'ch36Teeth', label: '出牙数' },
      { t: 'val', id: 'ch36Caries', label: '龋齿数' },
      { t: 'chk', name: 'ch36Ill', label: '两次随访间患病情况' },
      { t: 'chk', name: 'ch36Guide', label: '指导' },
      { t: 'val', id: 'ch36NextDate', label: '下次随访日期' },
      { t: 'val', id: 'ch36Doctor', label: '随访医生签名' },
      { t: 'val', id: 'ch36Status', label: '随访状态' }
    ]);
    if (miss.length) { toast('请完善必填项：' + miss.join('、'), 'warning'); return; }
    wmToastSaved('保存成功：3-6岁儿童健康检查记录已登记');
  }
  function mockChildHealth36y() {
    setVal('ch36Age', '4岁');
    setVal('ch36Date', todaySafe());
    setVal('ch36Weight', '17');
    setVal('ch36Height', '105');
    setRadio('ch36WeightLv', '中');
    setRadio('ch36HeightLv', '中');
    setRadio('ch36WhLv', '中');
    setChkByValue('ch36GrowthEval', '正常');
    setVal('ch36NakedL', '4.9');
    setVal('ch36NakedR', '4.9');
    setVal('ch36CorrL', '5.0');
    setVal('ch36CorrR', '5.0');
    setVal('ch36Teeth', '20');
    setVal('ch36Caries', '2');
    setRadio('ch36Chest', '未见异常');
    setRadio('ch36Abdomen', '未见异常');
    setVal('ch36Hgb', '125');
    setChkByValue('ch36Ill', '无');
    setRadio('ch36Referral', '无');
    setChkByValue('ch36Guide', '合理膳食');
    setVal('ch36Doctor', '吕雪');
    setVal('ch36Status', '正常');
  }

  /* =========================================================================
     儿童管理模块 · 新生儿专项筛查 / 眼保健及视力检查 / 生长发育监测图 / 5岁以下死亡登记
     ========================================================================= */
  var CN_ARCH_NO = '32101210310300001';
  /* 儿童业务视图 → 字段前缀（顶部信息栏 / 表单控件统一前缀） */
  var CN_HEAD_PFX = {
    childVisionNb: 'cvs', childHearingNb: 'chs', childDiseaseNb: 'cds',
    childEyeNb: 'cen', childEyeInfant: 'cei', childEyeToddler: 'cet', childEyePre: 'cep',
    childDeath5: 'cdt'
  };
  /* 顶部信息栏（姓名 / 档案编号）——设计稿值：张晓晓 / 32101210310300001 */
  function cnFillHead(pfx) {
    var nm = QS.get('name') || '张晓晓';
    var no = QS.get('archNo') || CN_ARCH_NO;
    var a = document.getElementById(pfx + 'NameTxt');
    var b = document.getElementById(pfx + 'ArchNo');
    if (a) a.textContent = nm;
    if (b) b.textContent = no;
  }
  /* 一组复选框：先清空，再按值勾选 */
  function cnSetChks(name, values) {
    var list = document.querySelectorAll('input[name="' + name + '"]');
    for (var i = 0; i < list.length; i++) list[i].checked = false;
    (values || []).forEach(function (v) { setChkByName(name, v); });
  }

  /* ---------- 新生儿视力筛查 ---------- */
  function saveChildVisionNb() {
    var miss = wmMissing([
      { t: 'val', id: 'cvsDelivery', label: '分娩方式' },
      { t: 'val', id: 'cvsNewbornCond', label: '新生儿情况' },
      { t: 'val', id: 'cvsMethod', label: '筛查方法' },
      { t: 'radio', name: 'cvsLeft', label: '左眼筛查' },
      { t: 'radio', name: 'cvsRight', label: '右眼筛查' },
      { t: 'radio', name: 'cvsOpinion', label: '筛查意见' },
      { t: 'val', id: 'cvsOrg', label: '检查机构' },
      { t: 'val', id: 'cvsDoctor', label: '检查医生' },
      { t: 'val', id: 'cvsDate', label: '检查日期' }
    ]);
    if (miss.length) { toast('请完善必填项：' + miss.join('、'), 'warning'); return; }
    cnFillHead('cvs');
    wmToastSaved('保存成功：新生儿视力筛查已登记');
  }
  function mockChildVisionNb() {
    cnFillHead('cvs');
    setVal('cvsParent', '网易易');
    setVal('cvsPhone', '15589898989');
    setVal('cvsInpatientNo', 'ZY20210303001');
    setVal('cvsOutpatientNo', 'MZ20210303001');
    setVal('cvsBedNo', '12');
    setVal('cvsDelivery', '自然分娩');
    setVal('cvsNewbornCond', '良好');
    setVal('cvsMethod', '红球试验');
    setRadio('cvsLeft', '通过');
    setRadio('cvsRight', '通过');
    setRadio('cvsOpinion', '通过');
    setVal('cvsOrg', '山东大学齐鲁医院');
    setVal('cvsDoctor', '吕雪');
    setVal('cvsDate', todaySafe());
  }

  /* ---------- 新生儿听力筛查 ---------- */
  function saveChildHearingNb() {
    var miss = wmMissing([
      { t: 'val', id: 'chsDelivery', label: '分娩方式' },
      { t: 'val', id: 'chsNewbornCond', label: '新生儿情况' },
      { t: 'val', id: 'chsMethod', label: '筛查方法' },
      { t: 'radio', name: 'chsOpinion', label: '筛查意见' },
      { t: 'val', id: 'chsOrg', label: '检查机构' },
      { t: 'val', id: 'chsDoctor', label: '检查医生' },
      { t: 'val', id: 'chsDate', label: '检查日期' }
    ]);
    if (miss.length) { toast('请完善必填项：' + miss.join('、'), 'warning'); return; }
    cnFillHead('chs');
    wmToastSaved('保存成功：新生儿听力筛查已登记');
  }
  function mockChildHearingNb() {
    cnFillHead('chs');
    setVal('chsParent', '网易易');
    setVal('chsPhone', '15589898989');
    setVal('chsInpatientNo', 'ZY20210303001');
    setVal('chsOutpatientNo', 'MZ20210303001');
    setVal('chsBedNo', '12');
    setVal('chsDelivery', '自然分娩');
    setVal('chsNewbornCond', '良好');
    setVal('chsMethod', '耳声发射');
    setRadio('chsLeft', '通过');
    setRadio('chsRight', '通过');
    setRadio('chsOpinion', '通过');
    setVal('chsOrg', '山东大学齐鲁医院');
    setVal('chsDoctor', '吕雪');
    setVal('chsDate', todaySafe());
  }

  /* ---------- 新生儿疾病筛查 ---------- */
  function saveChildDiseaseNb() {
    var miss = wmMissing([
      { t: 'val', id: 'cdsScreenNo', label: '筛查编号' },
      { t: 'val', id: 'cdsScreenDate', label: '筛查日期' },
      { t: 'val', id: 'cdsScreenItem', label: '筛查项目' },
      { t: 'val', id: 'cdsScreenMethod', label: '筛查方法' },
      { t: 'val', id: 'cdsScreenResult', label: '筛查结果' }
    ]);
    if (miss.length) { toast('请完善必填项：' + miss.join('、'), 'warning'); return; }
    cnFillHead('cds');
    wmToastSaved('保存成功：新生儿疾病筛查已登记');
  }
  function mockChildDiseaseNb() {
    cnFillHead('cds');
    /* 按设计稿：采血 4 行、筛查编号/项目/方法/结果 均为空态，仅「筛查日期 / 筛查单位 / 检查医生」有值 */
    setVal('cdsScreenDate', '2026-09-22');
    setVal('cdsOrg', '山东大学齐鲁医院');
    setVal('cdsDoctor', '吕雪');
  }

  /* ---------- 眼保健及视力检查（新生儿期 / 婴儿期 / 幼儿期 / 学龄前期） ---------- */
  function saveChildEye(pfx, title) {
    var miss = wmMissing([
      { t: 'val', id: pfx + 'First', label: pfx === 'cen' ? '项目' : (pfx === 'cep' ? '年龄' : '月龄') },
      { t: 'radio', name: pfx + 'Overall', label: '总体情况' },
      { t: 'val', id: pfx + 'Org', label: '检查机构' },
      { t: 'val', id: pfx + 'Doctor', label: '检查医生' },
      { t: 'val', id: pfx + 'Date', label: '检查日期' }
    ]);
    if (miss.length) { toast('请完善必填项：' + miss.join('、'), 'warning'); return; }
    cnFillHead(pfx);
    wmToastSaved('保存成功：' + title + '已登记');
  }
  function mockChildEye(pfx, makedata) {
    cnFillHead(pfx);
    pickSel(pfx + 'First');
    setRadio(pfx + 'Overall', '未见异常');
    if (makedata) makedata();
    setVal(pfx + 'Org', '山东大学齐鲁医院');
    setVal(pfx + 'Doctor', '吕雪');
    setVal(pfx + 'Date', todaySafe());
  }
  function saveChildEyeNb() { saveChildEye('cen', '新生儿期眼保健及视力检查'); }
  function mockChildEyeNb() { mockChildEye('cen'); }
  function saveChildEyeInfant() { saveChildEye('cei', '婴儿期眼保健及视力检查'); }
  function mockChildEyeInfant() { mockChildEye('cei'); }
  function saveChildEyeToddler() { saveChildEye('cet', '幼儿期眼保健及视力检查'); }
  function mockChildEyeToddler() { mockChildEye('cet'); }
  function saveChildEyePre() { saveChildEye('cep', '学龄前期眼保健及视力检查'); }
  function mockChildEyePre() {
    mockChildEye('cep', function () {
      /* 视力检查（由屈光筛查自动生成，只读灰底） */
      setVal('cepVisionL', '4.9');
      setVal('cepVisionR', '4.9');
      /* 屈光筛查 S/C/A */
      setVal('cepRefLS', '+1.25'); setVal('cepRefLC', '-0.50'); setVal('cepRefLA', '175');
      setVal('cepRefRS', '+1.00'); setVal('cepRefRC', '-0.75'); setVal('cepRefRA', '5');
    });
  }

  /* ---------- 生长发育监测图（图由设计稿曲线数据静态绘制） ---------- */
  function saveChildGrowth() {
    wmToastSaved('保存成功：生长发育监测图已保存');
  }
  function mockChildGrowth() { /* 曲线为参照曲线，无表单字段 */ }

  /* ---------- 5岁以下儿童死亡登记 ---------- */
  function saveChildDeath5() {
    var miss = wmMissing([
      { t: 'radio', name: 'cdtWeightFrom', label: '体重来源方式' },
      { t: 'radio', name: 'cdtHukou', label: '户籍类型' },
      { t: 'val', id: 'cdtDeathDate', label: '死亡日期' },
      { t: 'val', id: 'cdtAgeY', label: '死亡年龄（岁）' },
      { t: 'val', id: 'cdtInfer', label: '死亡推断' },
      { t: 'val', id: 'cdtDiagBasis', label: '诊断依据' },
      { t: 'val', id: 'cdtFillOrg', label: '填卡单位' }
    ]);
    if (miss.length) { toast('请完善必填项：' + miss.join('、'), 'warning'); return; }
    cnFillHead('cdt');
    wmToastSaved('保存成功：5岁以下儿童死亡登记已上报');
  }
  function mockChildDeath5() {
    cnFillHead('cdt');
    setVal('cdtBirthPlace', '江苏省扬州市江都区');
    setRadio('cdtWeightFrom', '测量');
    setVal('cdtFather', '张建国');
    setRadio('cdtHukou', '本地户口');
    setVal('cdtDeathDate', '2026-09-20');
    setVal('cdtDeathClass', '1-4岁儿童死亡');
    setVal('cdtAgeY', '4'); setVal('cdtAgeM', '0'); setVal('cdtAgeD', '0');
    setVal('cdtInfer', '意外伤害');
    setVal('cdtDiagLevel', '县级');
    setVal('cdtDiagBasis', '临床诊断');
    setVal('cdtDeathPlace', '医院');
    setRadio('cdtTreat', '住院');
    setVal('cdtFillOrg', '山东大学齐鲁医院');
    setVal('cdtFillDate', todaySafe());
  }

  /* 模拟数据（?edit=1 / 查看编辑进入）：与设计稿图3、图4 一致 */
  function mockChildArchive() {
    setVal('chName', '张晓晓');
    setRadio('chGender', '男性');
    setVal('chNation', '蒙古族');
    setVal('chIdcard', '110113202103036777');
    setVal('chBirth', '2021-03-03');
    setVal('chDoorNo1', 'xx');
    setVal('chRegAddr', '江苏省/扬州市/江都区/武坚镇/五舍村');
    setVal('chDoorNo2', 'xx');
    setVal('chLiveAddr', '江苏省/扬州市/江都区/武坚镇/五舍村');
    setVal('chGuardName', '网易易');
    setVal('chGuardIdcard', '110113202103036777');
    setVal('chGuardPhone', '15589898989');
    setVal('chGuardBirth', '2021-03-03');
    setRadio('chGuardJob', '无职业');
    setVal('chManageOrg', '山东大学齐鲁医院');
    setVal('chCreateOrg', '山东大学齐鲁医院');
    setVal('chDoctor', '吕雪');
  }

  /* ================= 初始化 ================= */
  function init() {
    buildFamTable();
    /* 中医管理：老年人中医药健康管理服务记录表（33 题量表）构建 */
    etsBuild();
    bindFamMutex();    bindMutex('allergyBox', '无');
    bindMutex('exposureBox', '无');
    bindMutex('disabilityBox', '无残疾');
    bindPastToggle();
    /* 孕产妇档案已建档（localStorage 记忆）→ 直接展开 8 个业务目录 */
    restoreMsModules();
    /* 预防接种记录信息已建档（localStorage 记忆）→ 展开「预防接种记录」目录 */
    restoreVaccineModules();
    /* 健康体检：右侧锚点定位的滚动联动绑定 */
    hcBindRail();

    /* 档案编号：查看/编辑带参进入显示原编号；新建流程按演示规则生成 */
    var n = new Date();
    var seq = '3210121' + String(n.getFullYear()).slice(2) + String(n.getMonth() + 1).padStart(2, '0') + String(n.getDate()).padStart(2, '0') + '0001';
    $('cvArchNo').value = QS.get('archNo') || seq;
    $('bhArchNo').textContent = QS.get('archNo') || seq;
    /* 封面横幅：新建流程未分配编号时显示“-”（与设计稿一致），带参进入时显示原编号 */
    $('cvArchNoShow').textContent = QS.get('archNo') || '-';

    /* 封面预填（新建弹框带来的基本数据） */
    $('cvName').value = P.name;
    $('cvPhone').value = P.phone;
    $('cvDate').value = todayStr();
    $('cvAddrDetail').value = P.addr;
    $('cvHAddrDetail').value = P.addr;
    var regionPreset = parseRegion(P.region);
    initCascade('cvP', regionPreset);
    initCascade('cvH', regionPreset);
    initCascaderWidget('cascCvP', 'cvP');
    initCascaderWidget('cascCvH', 'cvH');
    syncTown();
    bindCnt('cvName', 'cntCvName');
    bindCnt('cvAddrDetail', 'cntCvAddr');
    bindCnt('cvHAddrDetail', 'cntCvHAddr');
    /* 住址信息：常住类型行内嵌户籍地址、常住地址单行文本（地址级联在封面页维护） */
    var fullAddr = regionPreset.join('') + P.addr;
    $('biRegAddr').textContent = '户籍地址：' + fullAddr;
    $('biLiveAddr').textContent = fullAddr;
    var rsRadios = document.querySelectorAll('input[name="rsType"]');
    function syncRegAddr() {
      $('biRegAddr').style.display = document.querySelector('input[name="rsType"][value="户籍"]').checked ? '' : 'none';
    }
    rsRadios.forEach(function (r) { r.addEventListener('change', syncRegAddr); });
    syncRegAddr();

    /* 医疗费用支付方式：勾选“其他”时显示补充输入框（display 切换，未选时不占高度） */
    document.querySelector('input[name="pay"][value="其他"]').addEventListener('change', function () {
      $('payOther').style.display = this.checked ? '' : 'none';
      if (!this.checked) $('payOther').value = '';
    });

    /* 遗传病史：选“有”时显示补充输入框，选“无”时隐藏清空 */
    document.querySelectorAll('input[name="genetic"]').forEach(function (r) {
      r.addEventListener('change', function () {
        var show = this.value === '有' && this.checked;
        $('geneticOther').style.visibility = show ? 'visible' : 'hidden';
        if (!show) $('geneticOther').value = '';
      });
    });

    /* 残疾情况：勾选“其他残疾”时显示补充输入框（互斥清空场景同步隐藏） */
    $('disabilityBox').addEventListener('change', function () {
      var other = this.querySelector('input[value="其他残疾"]');
      $('disabilityOther').style.visibility = other.checked ? 'visible' : 'hidden';
      if (!other.checked) $('disabilityOther').value = '';
    });

    /* 药物过敏史：勾选“其他”时显示补充输入框（互斥清空场景同步隐藏） */
    $('allergyBox').addEventListener('change', function () {
      var other = this.querySelector('input[value="其他"]');
      $('allergyOther').style.visibility = other.checked ? 'visible' : 'hidden';
      if (!other.checked) $('allergyOther').value = '';
    });

    /* 法定传染病：勾选“其他法定传染病”时显示补充输入框 */
    $('hsDisBox').addEventListener('change', function () {
      var other = this.querySelector('input[value="其他法定传染病"]');
      $('hsDisOther').style.visibility = other.checked ? 'visible' : 'hidden';
      if (!other.checked) $('hsDisOther').value = '';
    });

    /* 基本信息预填 */
    $('biName').value = P.name;
    var g = document.querySelector('input[name="biGender"][value="' + P.gender + '"]');
    if (g) g.checked = true;
    $('biIdType').value = QS.get('idType') || '居民身份证';
    $('biIdcard').value = P.idcard;
    $('biBirth').value = P.birth;
    $('biNation').value = P.nation;
    $('biPhone').value = P.phone;
    /* 建档机构/日期：查看/编辑带参进入回显原档案信息 */
    setSelAdd('biOrg', QS.get('org'));
    $('biOrgShow').value = QS.get('org') || '山东大学齐鲁医院';
    $('bhOrg').textContent = QS.get('org') || '山东大学齐鲁医院';
    $('biCreateDate').value = QS.get('created') || todayStr();

    /* 籍贯：省市两级级联（单框点击展开选择） */
    initCascade('biJG', regionPreset.length > 1 ? [regionPreset[0], regionPreset[1]] : [Object.keys(ADDR)[0]]);
    initCascaderWidget('cascJG', 'biJG', 2);

    renderPatientBar();
    renderComplete();

    /* 表单变化 → 完整度与顶部信息栏实时联动 */
    $('viewBasic').addEventListener('change', function () { renderComplete(); renderPatientBar(); });
    $('viewBasic').addEventListener('input', function (e) {
      if (e.target.id === 'biName' || e.target.id === 'biIdcard' || e.target.id === 'biBirth' || e.target.id === 'biPhone') renderPatientBar();
      renderComplete();
    });
    $('viewCover').addEventListener('change', function () { renderPatientBar(); });

    /* 高血压专项表预填 */
    $('hpName').textContent = P.name;
    $('hpArchNo').textContent = QS.get('archNo') || $('cvArchNo').value || '--';
    $('hpCreateDate').value = todayStr();
    bindHpComplMutex();

    /* 高血压管理列表「查看/编辑」带参进入：已有档案全量预填专项表，并直接开放随访/评估目录 */
    if (QS.get('sbp') || QS.get('edit')) {
      var isMale = (QS.get('gender') || P.gender) === '男性';
      $('hpHeight').value = isMale ? '170' : '160';
      $('hpWeight').value = isMale ? '72' : '60';
      calcBmi();
      $('hpSbp').value = QS.get('sbp');
      $('hpDbp').value = QS.get('dbp') || '';
      autoHpGrade();
      setSelIf('hpType', QS.get('hpType') || '原发性高血压');
      setSelIf('hpSource', '门诊');
      var noCompl = document.querySelector('#hpComplicationBox input[value="无"]');
      if (noCompl) noCompl.checked = true;
      var hpReg = document.querySelector('input[name="hpCompliance"][value="规律"]');
      if (hpReg) hpReg.checked = true;
      setSelAdd('hpDiagOrg', QS.get('specOrg'));
      setSelAdd('hpCreateOrg', QS.get('specOrg'));
      setSelAdd('hpCreateDoc', QS.get('specDoc'));
      var hpSpec = QS.get('specDate');
      if (hpSpec) {
        $('hpCreateDate').value = hpSpec;
        /* 确诊日期取建档日期前 2 年，贴合病史时间线 */
        $('hpDiagDate').value = (parseInt(hpSpec.slice(0, 4), 10) - 2) + hpSpec.slice(4);
      }
      $('navHpFollowup').classList.remove('nav-followup-hidden');
      $('navHpAssessment').classList.remove('nav-followup-hidden');
    }

    /* 高血压随访表预填 */
    $('fuName').textContent = P.name;
    $('fuArchNo').textContent = QS.get('archNo') || $('cvArchNo').value || '--';
    $('fuDate').value = todayStr();

    /* 高血压评估表预填 */
    $('asName').textContent = P.name;
    $('asArchNo').textContent = QS.get('archNo') || $('cvArchNo').value || '--';
    $('asDate').value = todayStr();
    bindAssessment();

    /* 糖尿病专项表预填 */
    $('dmName').textContent = P.name;
    $('dmArchNo').textContent = QS.get('archNo') || $('cvArchNo').value || '--';
    $('dmCreateDate').value = todayStr();

    /* 糖尿病随访表预填 */
    $('dmFuName').textContent = P.name;
    $('dmFuArchNo').textContent = QS.get('archNo') || $('cvArchNo').value || '--';
    $('dmFuDate').value = todayStr();

    /* 糖尿病评估表预填 */
    $('dmAsName').textContent = P.name;
    $('dmAsArchNo').textContent = QS.get('archNo') || $('cvArchNo').value || '--';
    $('dmAsDate').value = todayStr();

    /* 慢阻肺专项表预填 */
    $('copdName').textContent = P.name;
    $('copdArchNo').textContent = QS.get('archNo') || $('cvArchNo').value || '--';
    $('copdCreateDate').value = todayStr();
    bindCopdMutex('copdRiskBox', 'copdRisk');
    bindCopdMutex('copdBasisBox', 'copdBasis');

    /* 肿瘤专项表预填 */
    $('tmName').textContent = P.name;
    $('tmArchNo').textContent = QS.get('archNo') || $('cvArchNo').value || '--';
    $('tmCreateDate').value = todayStr();
    tmSmokeChange();
    tmTnmChange();

    /* 肿瘤随访表预填 */
    $('tfName').textContent = P.name;
    $('tfArchNo').textContent = QS.get('archNo') || $('cvArchNo').value || '--';
    $('tfDate').value = todayStr();

    /* 高危专项表预填 */
    $('hrName').textContent = P.name;
    $('hrGender').textContent = P.gender;
    $('hrBirth').textContent = P.birth;
    $('hrArchNo').textContent = QS.get('archNo') || $('cvArchNo').value || '--';
    $('hrFollowDate').value = todayStr();

    /* 高危随访表预填 */
    $('hfName').textContent = P.name;
    $('hfArchNo').textContent = QS.get('archNo') || $('cvArchNo').value || '--';
    $('hfDate').value = todayStr();

    /* 结核病第一次入户随访表预填 */
    $('tb1Name').textContent = P.name;
    $('tb1ArchNo').textContent = QS.get('archNo') || $('cvArchNo').value || '--';
    $('tb1Date').value = todayStr();

    /* 结核病患者随访服务记录表预填 */
    $('tb2Name').textContent = P.name;
    $('tb2ArchNo').textContent = QS.get('archNo') || $('cvArchNo').value || '--';
    $('tb2Date').value = todayStr();

    /* 重精个人信息补充表预填 */
    $('psi1Name').textContent = P.name;
    $('psi1ArchNo').textContent = QS.get('archNo') || $('cvArchNo').value || '--';
    $('psi1SignDate').value = todayStr();
    $('psi1DiagDate').value = todayStr();
    $('psi1FillDate').value = todayStr();
    $('psi1Opinion').addEventListener('input', psi1OpinionCount);

    /* 重精随访服务记录表预填 */
    $('psi2Name').textContent = P.name;
    $('psi2ArchNo').textContent = QS.get('archNo') || $('cvArchNo').value || '--';
    $('psi2Date').value = todayStr();

    /* 心脑血管评估表预填 */
    $('caName').textContent = P.name;
    $('caArchNo').textContent = QS.get('archNo') || $('cvArchNo').value || '--';
    $('caAssessDate').value = todayStr();

    /* 心脑血管高危人群随访表预填 */
    $('cvPtName').textContent = P.name;
    $('cvArchNo2').textContent = QS.get('archNo') || $('cvArchNo').value || '--';
    $('cvFDate').value = todayStr();

    /* 高血脂专项表预填 */
    $('hlpName').textContent = P.name;
    $('hlpArchNo').textContent = QS.get('archNo') || $('cvArchNo').value || '--';
    if (QS.get('specOrg')) $('hlpOrg').value = QS.get('specOrg');
    $('hlpCreateDate').value = todayStr();

    /* 健康教育记录表预填（姓名 / 档案编号 / 日期默认为当天，干预医生默认为责任医生） */
    $('heName').textContent = P.name;
    $('heArchNo').textContent = QS.get('archNo') || $('cvArchNo').value || '--';
    $('heDate').value = todayStr();
    $('heDoctor').value = QS.get('doctor') || '吕雪';

    /* 妇女管理模块：表头姓名/档案编号 + 时间字段默认当天 */
    ['wa', 'pm', 'fa', 'ppg', 'wd'].forEach(function (p) {
      var nm = document.getElementById(p + 'NameTxt');
      if (nm) nm.textContent = P.name;
      var an = document.getElementById(p + 'ArchNo');
      if (an) an.textContent = QS.get('archNo') || '-';
    });
    if ($('waCreateDate')) $('waCreateDate').value = todayStr();
    if ($('pmExamDate')) $('pmExamDate').value = todayStr();
    if ($('faDate')) $('faDate').value = todayStr();
    if ($('ppgDate')) $('ppgDate').value = todayStr();
    if ($('wdFillDate')) $('wdFillDate').value = todayStr();
    /* 多选互斥：勾「无」清空其他项 */
    ['ppgPastDis', 'ppgNowDis', 'ppgBirth', 'ppgHeredity', 'ppgKinship', 'ppgVaccine', 'ppgHazard'].forEach(function (id) {
      if (document.getElementById(id)) bindMutex(id, '无');
    });

    /* 儿童管理：儿童档案信息预填（新建弹框带参进入 / 列表页查看编辑带参进入） */
    $('chNameTxt').textContent = QS.get('name') || P.name;
    $('chArchNo').textContent = QS.get('archNo') || '-';
    $('chCreateDate').value = todayStr();
    if (QS.get('name')) $('chName').value = QS.get('name');
    if (QS.get('gender')) setRadio('chGender', QS.get('gender'));
    if (QS.get('nation')) $('chNation').value = QS.get('nation');
    if (QS.get('idcard')) $('chIdcard').value = QS.get('idcard');
    if (QS.get('birth')) $('chBirth').value = QS.get('birth');
    if (QS.get('addr')) { $('chRegAddr').value = QS.get('addr'); $('chLiveAddr').value = QS.get('addr'); }
    if (QS.get('addrDetail')) { $('chDoorNo1').value = QS.get('addrDetail'); $('chDoorNo2').value = QS.get('addrDetail'); }
    if (QS.get('guard')) $('chGuardName').value = QS.get('guard');
    if (QS.get('guardIdcard')) $('chGuardIdcard').value = QS.get('guardIdcard');
    if (QS.get('guardPhone')) $('chGuardPhone').value = QS.get('guardPhone');

    /* 儿童管理：出生医学证明 / 新生儿家庭访视 / 3 张健康检查表预填 */
    cnFillDict();
    var cnName = QS.get('name') || P.name;
    var cnBirth = QS.get('birth') || P.birth;
    var cnIdcard = QS.get('idcard') || P.idcard;
    var cnArchNo = QS.get('archNo') || '-';
    var cnAddr = QS.get('addr')
      ? QS.get('addr').replace(/\//g, '') + (QS.get('addrDetail') || '')
      : (P.region || '') + (P.addr || '');
    ['cbc', 'cnv', 'ch18', 'ch1230', 'ch36'].forEach(function (p) {
      var nt = document.getElementById(p + 'NameTxt');
      if (nt) nt.textContent = cnName;
      var an = document.getElementById(p + 'ArchNo');
      if (an) an.textContent = cnArchNo;
    });
    /* 出生医学证明 */
    $('cbcName').value = cnName;
    if (QS.get('gender')) setRadio('cbcGender', QS.get('gender').replace(/性$/, ''));
    $('cbcBirth').value = cnBirth;
    /* 新生儿家庭访视 */
    $('cnvName').value = cnName;
    if (QS.get('gender')) setRadio('cnvGender', QS.get('gender').replace(/性$/, ''));
    $('cnvBirth').value = cnBirth;
    $('cnvIdcard').value = cnIdcard;
    $('cnvHomeAddr').value = cnAddr;
    $('cnvVisitDate').value = todayStr();
    /* 1-8月龄 / 12-30月龄 / 3-6岁 健康检查：随访日期默认当天 */
    ['ch18Date', 'ch1230Date', 'ch36Date'].forEach(function (id) { if ($(id)) $(id).value = todayStr(); });
    /* 换页时同步顶部信息栏 */
    ['cbcName', 'cnvName'].forEach(function (id) {
      if ($(id)) $(id).addEventListener('input', renderChildBar);
    });

    /* 高血脂患者随访表预填（姓名 + 随访日期默认为当天） */
    $('hlpFuName').textContent = P.name;
    $('hlpFuDate').value = todayStr();
    bindHlpFuSymptomMutex();
    if (QS.get('height')) $('cvHeight').textContent = QS.get('height');

    /* 健康信息卡预填 */
    $('hcName').value = P.name;
    $('hcGender').value = (QS.get('gender') || P.gender || '').replace(/性$/, '');
    $('hcBirth').value = P.birth;
    $('hcArchNo').value = QS.get('archNo') || $('cvArchNo').value || '';
    $('hcAddr').value = QS.get('addr') || '';
    $('hcTel').value = P.phone;
    bindCopdMutex('hcChronicBox', 'hcChronic');

    /* 死亡登记表（居民死亡医学证明（推断）书）预填 */
    $('dtName').value = P.name;
    $('dtGender').value = (QS.get('gender') || P.gender || '').replace(/性$/, '');
    $('dtCountry').value = '中国';
    $('dtNation').value = P.nation;
    $('dtIdType').value = QS.get('idType') || '居民身份证';
    $('dtIdcard').value = P.idcard;
    $('dtBirth').value = P.birth;
    $('dtAge').value = ageFromBirth(P.birth);
    $('dtMarriage').value = QS.get('marriage') || '已婚';
    $('dtProv').value = '江苏省';
    $('dtCity').value = '扬州市';
    $('dtCounty').value = '江都区';
    $('dtDeathDate').value = todayStr();
    $('dtWork').value = QS.get('work') || '1';
    $('dtRegAddr').value = QS.get('addr') || (P.region + P.addr);
    $('dtLiveAddr').value = QS.get('addr') || (P.region + P.addr);
    $('dtDoctor').value = QS.get('doctor') || '吕雪';
    $('dtOrg').value = QS.get('specOrg') || '山东大学齐鲁医院';
    $('dtFillDate').value = todayStr();
    $('dtSurveyDate').value = todayStr();

    /* 慢阻肺随访表预填与联动绑定 */
    $('cfName').textContent = P.name;
    $('cfArchNo').textContent = QS.get('archNo') || $('cvArchNo').value || '--';
    $('cfDate').value = todayStr();
    bindCopdMutex('cfComorbidityBox', 'cfComorbidity');
    bindCopdMutex('cfAdverseBox', 'cfAdverse');
    /* 慢阻肺随访带参预填：分级/随访分类 */
    if (QS.get('grade')) {
      var cfgr = document.querySelector('input[name="cfGrade"][value="' + QS.get('grade') + '"]');
      if (cfgr) cfgr.checked = true;
    }
    if (QS.get('category')) {
      var cfcat = document.querySelector('input[name="cfCategory"][value="' + QS.get('category') + '"]');
      if (cfcat) cfcat.checked = true;
    }

    /* 慢阻肺管理列表「查看/编辑/新建专项」带参进入：预填分级/血压/确诊信息 */
    if (QS.get('grade') || QS.get('sbp') || QS.get('diagDate')) {
      var cgrade = QS.get('grade') || '';
      if (cgrade) {
        var cr = document.querySelector('input[name="copdGrade"][value="' + cgrade + '"]');
        if (cr) cr.checked = true;
      }
      if (QS.get('sbp')) $('copdSbp').value = QS.get('sbp');
      if (QS.get('dbp')) $('copdDbp').value = QS.get('dbp');
      setSelAdd('copdDiagOrg', QS.get('diagOrg'));
      setSelAdd('copdCreateOrg', QS.get('specOrg'));
      if (QS.get('diagDate')) $('copdDiagDate').value = QS.get('diagDate');
      if (QS.get('specDate')) $('copdCreateDate').value = QS.get('specDate');
    }

    /* 残疾人基本信息：顶部「姓名 / 档案编号」条预填 */
    disFillHead();

    /* 根据 URL 参数 view 决定初始视图（?view=diabetes 直接进入糖尿病专项表） */
    var initView = QS.get('view') || 'cover';
    if (initView === 'hypertension') {
      switchView('hypertension');
    } else if (initView === 'basic') {
      switchView('basic');
    } else if (initView === 'followup') {
      switchView('followup');
    } else if (initView === 'assessment') {
      switchView('assessment');
    } else if (initView === 'diabetes') {
      revealDmModules();
      switchView('diabetes');
    } else if (initView === 'dmFollowup') {
      revealDmModules();
      switchView('dmFollowup');
    } else if (initView === 'dmAssessment') {
      revealDmModules();
      switchView('dmAssessment');
    } else if (initView === 'copd') {
      revealChronicFollowup('copd');
      switchView('copd');
    } else if (initView === 'copdFollowup') {
      revealChronicFollowup('copd');
      switchView('copdFollowup');
    } else if (initView === 'tumor') {
      revealChronicFollowup('tumor');
      switchView('tumor');
    } else if (initView === 'tumorFollowup') {
      revealChronicFollowup('tumor');
      switchView('tumorFollowup');
    } else if (initView === 'hr') {
      revealChronicFollowup('hr');
      switchView('hr');
    } else if (initView === 'hrFollowup') {
      revealChronicFollowup('hr');
      switchView('hrFollowup');
    } else if (initView === 'tb') {
      revealChronicFollowup('tb');
      switchView('tb');
    } else if (initView === 'tbFollowup') {
      revealChronicFollowup('tb');
      switchView('tbFollowup');
    } else if (initView === 'psi') {
      revealChronicFollowup('psi');
      switchView('psi');
    } else if (initView === 'psiFollowup') {
      revealChronicFollowup('psi');
      switchView('psiFollowup');
    } else if (initView === 'cardio') {
      revealChronicFollowup('cardio');
      switchView('cardio');
    } else if (initView === 'cardioFollowup') {
      revealChronicFollowup('cardio');
      switchView('cardioFollowup');
    } else if (initView === 'hyperlipidemia') {
      revealChronicFollowup('hlp');
      switchView('hyperlipidemia');
    } else if (initView === 'hlpFollowup') {
      revealChronicFollowup('hlp');
      switchView('hlpFollowup');
    } else if (initView === 'healthCard') {
      switchView('healthCard');
    } else if (initView === 'death') {
      switchView('death');
    } else if (initView === 'serviceAct') {
      switchView('serviceAct');
    } else if (initView === 'healthEdu') {
      switchView('healthEdu');
    } else if (initView === 'womanArchive') {
      switchView('womanArchive');
    } else if (initView === 'preMarital') {
      revealWomanModules();
      switchView('preMarital');
    } else if (initView === 'folicAcid') {
      revealWomanModules();
      switchView('folicAcid');
    } else if (initView === 'prePregnancy') {
      revealWomanModules();
      switchView('prePregnancy');
    } else if (initView === 'womanDisease') {
      revealWomanModules();
      switchView('womanDisease');
    } else if (initView === 'childArchive') {
      switchView('childArchive');
    } else if (initView === 'childBirthCert') {
      switchView('childBirthCert');
    } else if (initView === 'childNewbornVisit') {
      switchView('childNewbornVisit');
    } else if (initView === 'childHealth18m') {
      switchView('childHealth18m');
    } else if (initView === 'childHealth1230m') {
      switchView('childHealth1230m');
    } else if (initView === 'childHealth36y') {
      switchView('childHealth36y');
    } else if (initView === 'msArchive') {
      switchView('msArchive');
    } else if (initView === 'msPrenatal1' || initView === 'msPrenatalVisit' || initView === 'msDelivery'
               || initView === 'msPostVisit' || initView === 'msPost42') {
      revealMsModules();
      switchView(initView);
    } else if (initView === 'msRiskScreen' || initView === 'msRiskAssess') {
      revealMsModules();
      switchView(initView);
    }
    else if (initView === 'elderlySelfCare') {
      switchView('elderlySelfCare');
    }
    /* 中医管理：老年人中医药健康管理服务记录表 */
    else if (initView === 'elderTcmService') {
      etsFillHead();
      switchView('elderTcmService');
    }
    else if (initView === 'tcmGuide') {
      tcgFillHead();
      switchView('tcmGuide');
    }
    else if (initView === 'disability') {
      switchView('disability');
    }
    /* 预防接种业务：预防接种记录信息（基本信息）/ 预防接种记录 */
    else if (initView === 'vaccineInfo') {
      vcFillHead();
      switchView('vaccineInfo');
    }
    else if (initView === 'vaccineRecord') {
      vcFillHead();
      revealVaccineModules();
      switchView('vaccineRecord');
    }
    /* 健康体检：五页合并长表单 */
    else if (initView === 'healthCheckup') {
      hcFillHead();
      switchView('healthCheckup');
      hcSyncAll();
    }
    /* 儿童业务 · 9 个专项视图 */
    else if (CN_HEAD_PFX[initView]) {
      cnFillHead(CN_HEAD_PFX[initView]);
      switchView(initView);
    }
    else if (initView === 'childGrowth') {
      switchView('childGrowth');
    }

    /* 编辑/查看进入（?edit=1）：自动模拟专项内容，并补全该模块目录（开放随访/评估子项） */
    if (QS.get('edit')) {
      if (initView === 'diabetes') { mockDiabetes(); $('navDmFollowup').classList.remove('nav-followup-hidden'); $('navDmAssessment').classList.remove('nav-followup-hidden'); }
      else if (initView === 'copd') { mockCopd(); $('navCopdFollowup').classList.remove('nav-followup-hidden'); }
      else if (initView === 'hyperlipidemia') { mockHyperlipidemia(); $('navHlpFollowup').classList.remove('nav-followup-hidden'); }
      else if (initView === 'cardio') { mockCardio(); $('navCardioFollowup').classList.remove('nav-followup-hidden'); }
      else if (initView === 'tumor') { mockTumor(); $('navTumorFollowup').classList.remove('nav-followup-hidden'); }
      else if (initView === 'hr') { mockHr(); $('navHrFollowup').classList.remove('nav-followup-hidden'); }
      else if (initView === 'psi') { mockPsi(); $('navPsiFollowup').classList.remove('nav-followup-hidden'); }
      else if (initView === 'tb') { mockTb(); $('navTbFollowup').classList.remove('nav-followup-hidden'); }
      else if (initView === 'healthEdu') { mockHealthEdu(); }
      else if (initView === 'womanArchive') { mockWomanArchive(); revealWomanModules(); }
      else if (initView === 'preMarital') { mockPreMarital(); }
      else if (initView === 'folicAcid') { mockFolicAcid(); }
      else if (initView === 'prePregnancy') { mockPrePregnancy(); }
      else if (initView === 'womanDisease') { mockWomanDisease(); }
      else if (initView === 'childArchive') {
        /* 已有儿童档案：模拟填全 + 分配档案编号 + 开放「结案」 */
        mockChildArchive();
        $('chArchNo').textContent = '32101210310300001';
        $('chBtnClose').style.display = '';
        $('chNameTxt').textContent = $('chName').value.trim() || P.name;
        renderChildBar();
      }
      else if (initView === 'childBirthCert') {
        mockChildBirthCert();
        $('cbcArchNo').textContent = '32101210010000313';
        $('cbcNameTxt').textContent = $('cbcName').value.trim() || P.name;
        renderChildBar();
      }
      else if (initView === 'childNewbornVisit') {
        mockChildNewbornVisit();
        $('cnvArchNo').textContent = '32101210010000313';
        $('cnvNameTxt').textContent = $('cnvName').value.trim() || P.name;
        renderChildBar();
      }
      else if (initView === 'childHealth18m') { mockChildHealth18m(); }
      else if (initView === 'childHealth1230m') { mockChildHealth1230m(); }
      else if (initView === 'childHealth36y') { mockChildHealth36y(); }
      else if (initView === 'msArchive') { mockMsArchive(); }
      else if (initView === 'msPrenatal1') { mockMsPrenatal1(); }
      else if (initView === 'msPrenatalVisit') { mockMsPrenatalVisit(); }
      else if (initView === 'msDelivery') { mockMsDelivery(); }
      else if (initView === 'msPostVisit') { mockMsPostVisit(); }
      else if (initView === 'msPost42') { mockMsPost42(); }
      else if (initView === 'msRiskScreen') { mockMsRiskScreen(); }
      else if (initView === 'msRiskAssess') { mockMsRiskAssess(); }
      else if (initView === 'elderlySelfCare') { mockEaSelfCare(); }
      else if (initView === 'elderTcmService') { mockElderTcmService(); }
      else if (initView === 'tcmGuide') { mockTcmGuide(); }
      else if (initView === 'disability') { mockDisability(); }
      /* 预防接种业务：已有档案 → 回填设计稿演示值并开放「预防接种记录」目录 */
      else if (initView === 'vaccineInfo') { mockVaccineInfo(); revealVaccineModules(); }
      else if (initView === 'vaccineRecord') { mockVaccineRecord(); }
      /* 儿童业务 · 9 个专项视图 */
      else if (initView === 'childVisionNb') { mockChildVisionNb(); }
      else if (initView === 'childHearingNb') { mockChildHearingNb(); }
      else if (initView === 'childDiseaseNb') { mockChildDiseaseNb(); }
      else if (initView === 'childEyeNb') { mockChildEyeNb(); }
      else if (initView === 'childEyeInfant') { mockChildEyeInfant(); }
      else if (initView === 'childEyeToddler') { mockChildEyeToddler(); }
      else if (initView === 'childEyePre') { mockChildEyePre(); }
      else if (initView === 'childGrowth') { mockChildGrowth(); }
      else if (initView === 'childDeath5') { mockChildDeath5(); }
      /* 健康体检：回填设计稿演示值 */
      else if (initView === 'healthCheckup') { mockHealthCheckup(); }
      /* 个人基本信息表：按居民数据模拟填报 */
      else if (initView === 'basic') { mockBasicForm(); }
      /* 高血压由上方 sbp/edit 分支处理并补全目录 */
    }
  }

  /* ================= 个人基本信息表模拟填报（居民档案列表「查看/编辑」带参进入时全量回填已有档案） ================= */
  function setChkByText(name, text) {
    var els = document.querySelectorAll('input[name="' + name + '"]');
    Array.prototype.forEach.call(els, function (b) {
      if (b.parentNode.textContent.trim() === text) b.checked = true;
    });
  }
  function setRadioByText(name, text) {
    var els = document.getElementsByName(name);
    for (var i = 0; i < els.length; i++) {
      if (els[i].parentNode.textContent.trim() === text) { els[i].checked = true; return; }
    }
  }
  function mockBasicForm() {
    var crowd = (QS.get('crowd') || '').split(',').filter(Boolean);
    var age = parseInt(calcAge(P.birth), 10) || 0;
    var isElderly = age >= 65;
    var isChild = age > 0 && age <= 6;

    /* 1. 个人健康标识 */
    if (isChild) setRadioChecked('crowd', '0-6岁儿童');
    else if (isElderly) setRadioChecked('crowd', '65岁及以上老年人');
    if (crowd.indexOf('高') !== -1) setChkByText('hsDis', '高血压');
    if (crowd.indexOf('糖') !== -1) setChkByText('hsDis', '2型糖尿病');
    else if (isElderly) setChkByText('hsDis', '高血压');
    setRadioChecked('hsWeight', '正常');
    setRadioChecked('abo', 'A型');
    setRadioChecked('rh', '阳性');

    /* 4. 基本信息 / 管理信息 */
    $('biWork').value = isChild ? '' : (isElderly ? '退休' : '个体经营');
    $('biBirthplace').value = (P.region || '山东省济南市').replace(/^山东省/, '');
    $('biMgrPhone').value = '053186911234';
    setRadioChecked('fdSign', '是');
    $('biFdName').value = '冯仁卉';
    $('biFdPhone').value = '13800001111';

    /* 6. 紧急联系人 */
    $('ec1Name').value = '张建国';
    $('ec1Rel').value = '配偶';
    $('ec1Phone').value = '13700000001';
    $('ec2Name').value = '张伟';
    $('ec2Rel').value = '子女';
    $('ec2Phone').value = '13600000002';

    /* 8. 文化程度 / 职业 / 婚姻状况 */
    setRadioChecked('biEdu', isChild ? '不详' : (isElderly ? '初中' : '大学本科'));
    setRadioChecked('biJob', isElderly || isChild ? '无职业' : '专业技术人员');
    setRadioByText('marriage', isChild ? '未婚' : '初婚');

    /* 9. 医疗费用支付方式：改选城镇职工医保，取消默认「其他」并隐藏补充输入框 */
    var payOther = document.querySelector('input[name="pay"][value="其他"]');
    if (payOther) { payOther.checked = false; payOther.dispatchEvent(new Event('change')); }
    setChkByName('pay', '城镇居民基本医疗保险');

    /* 10. 个人健康凭证 */
    setSelIf('cert1Name', '预防接种证');
    $('cert1No').value = '3701021985';
    $('cert1Org').value = '济南市历下区疾病预防控制中心';
    $('cert1Date').value = '2001-01-10';
    $('cert1Exp').value = '2031-01-10';

    /* 11. 药物过敏史：无 */
    setChkByName('allergy', '无');
    /* 12. 暴露史：无 */
    setChkByName('exposure', '无');
    /* 13. 既往史：疾病按人群勾选，其余保持默认无 */
    if (crowd.indexOf('高') !== -1) setChkByName('pastDis', '高血压');
    if (crowd.indexOf('糖') !== -1) setChkByName('pastDis', '糖尿病');
    if (crowd.indexOf('高') === -1 && crowd.indexOf('糖') === -1) setChkByName('pastDis', '无');

    /* 17. 人群性质 */
    if (crowd.indexOf('老') !== -1) setChkByText('population', '65以上常住居民');
    if (crowd.indexOf('高') !== -1) setChkByText('population', '高血压患者');
    if (crowd.indexOf('糖') !== -1) setChkByText('population', '糖尿病患者');
    if (crowd.indexOf('儿') !== -1) setChkByText('population', '0-6岁儿童');
    if (crowd.length === 0) setChkByText('population', '普通人群');

    /* 18. 建档信息：责任医生/建档人回显 */
    setSelIf('biDoctor', '吕雪');
    setSelIf('biCreator', '吕雪');

    renderComplete();
    renderPatientBar();
  }

  /* ================= 孕产妇妊娠风险筛查表 / 妊娠风险评估表 ================= */
  /* 组头折叠 */
  function toggleRk(hd) {
    var sec = hd.parentNode;
    if (sec) sec.classList.toggle('collapsed');
  }
  function rkCount(name) {
    return document.querySelectorAll('input[name="' + name + '"]:checked').length;
  }
  /* 妊娠风险筛查表：保存（0 项 = 筛查阴性；≥1 项 = 筛查阳性） */
  function saveMsRiskScreen() {
    var n = rkCount('rskItem');
    msFillHead('rsk');
    if (n === 0) { wmToastSaved('保存成功：未发现筛查阳性内容，筛查结果为「阴性」'); }
    else { wmToastSaved('保存成功：筛查阳性（共 ' + n + ' 项），请于 2 周内至上级医疗机构接受妊娠风险评估'); }
    return n;
  }
  function mockMsRiskScreen() {
    var pick = ['1.1', '1.3', '2.1', '4.2', '6.1'];
    var all = document.querySelectorAll('#viewMsRiskScreen input[name="rskItem"]');
    Array.prototype.forEach.call(all, function (b) {
      var t = b.parentNode.textContent.trim().split(' ')[0];
      if (pick.indexOf(t) >= 0) b.checked = true;
    });
    msFillHead('rsk');
  }
  /* 妊娠风险评估表：保存（按勾选项所处分级取最高风险，紫色可与其他分级共存） */
  function saveMsRiskAssess() {
    var order = ['green', 'yellow', 'orange', 'red', 'purple'];
    var label = { green: '绿色（低风险）', yellow: '黄色（一般风险）', orange: '橙色（较高风险）',
                  red: '红色（高风险）', purple: '紫色（孕妇患有传染性疾病）' };
    var hit = [], n = 0;
    order.forEach(function (k) {
      var sec = document.querySelector('#viewMsRiskAssess .rk-sec[data-lv="' + k + '"]');
      if (!sec) return;
      var c = sec.querySelectorAll('input[name="asmItem"]:checked').length;
      if (c > 0) { hit.push(k); n += c; }
    });
    msFillHead('asm');
    if (!hit.length) { toast('请至少勾选一项孕产妇相关情况后再保存', 'warning'); return; }
    var worst = 'green';
    ['yellow', 'orange', 'red'].forEach(function (k) { if (hit.indexOf(k) >= 0) worst = k; });
    var lv = hit.indexOf('purple') >= 0 ? '紫色' : label[worst];
    wmToastSaved('保存成功：评估分级为「' + lv + '」，共勾选 ' + n + ' 项');
  }
  function mockMsRiskAssess() {
    var pick = ['1.1', '1.2', '2.11', '3.12'];
    var all = document.querySelectorAll('#viewMsRiskAssess input[name="asmItem"]');
    Array.prototype.forEach.call(all, function (b) {
      var t = b.parentNode.textContent.trim().split(' ')[0];
      if (pick.indexOf(t) >= 0) b.checked = true;
    });
    msFillHead('asm');
  }

  /* ================= 老年人管理：老年人自理能力评估表 ================= */
  var EA_ARCH_NO = '32101211811812487';
  var EA_ITEMS = ['进食', '梳洗', '穿衣', '如厕', '活动'];
  var EA_LEVELS = ['可自理', '轻度依赖', '中度依赖', '不可自理'];
  /* 勾选后实时刷新「判断评分」与「合计」 */
  function calcEaTotal() {
    var total = 0;
    for (var i = 1; i <= EA_ITEMS.length; i++) {
      var sel = document.querySelector('input[name="eaItem' + i + '"]:checked');
      var cell = $('eaScore' + i);
      if (sel) {
        var v = parseInt(sel.value, 10);
        if (isNaN(v)) v = 0;
        total += v;
        if (cell) cell.textContent = v;
      } else if (cell) {
        cell.textContent = '';
      }
    }
    var t = $('eaTotal');
    if (t) t.textContent = total;
    return total;
  }
  /* 已选项里最高的一档依赖程度 */
  function eaTopLevel() {
    var best = -1;
    for (var i = 1; i <= EA_ITEMS.length; i++) {
      var sel = document.querySelector('input[name="eaItem' + i + '"]:checked');
      if (!sel) continue;
      var idx = EA_LEVELS.indexOf(sel.getAttribute('data-level'));
      if (idx > best) best = idx;
    }
    return best < 0 ? '' : EA_LEVELS[best];
  }
  function eaFillHead() {
    var t = $('eaNameTxt'), a = $('eaArchNo');
    if (t) t.textContent = P.name;
    if (a) a.textContent = EA_ARCH_NO;
  }
  function saveEaSelfCare() {
    var missing = wmMissing([
      { t: 'val', id: 'eaDoctor', label: '评估医师' },
      { t: 'val', id: 'eaDate', label: '评估日期' }
    ]);
    if (missing.length) { toast('请完善必填项：' + missing.join('、'), 'warning'); return; }
    var undone = [];
    for (var i = 1; i <= EA_ITEMS.length; i++) {
      if (!document.querySelector('input[name="eaItem' + i + '"]:checked')) undone.push(EA_ITEMS[i - 1]);
    }
    if (undone.length) { toast('请完成以下评估项：' + undone.join('、'), 'warning'); return; }
    var total = calcEaTotal();
    eaFillHead();
    wmToastSaved('保存成功：合计 ' + total + ' 分（最高依赖程度：' + eaTopLevel() + '）');
  }
  function mockEaSelfCare() {
    eaFillHead();
    setVal('eaDoctor', '吕雪');
    setVal('eaDate', '2026-09-22');
    /* 设计稿中 5 项均未勾选、判断评分为空、合计 0 —— 保持一致 */
    Array.prototype.forEach.call(document.querySelectorAll('#viewElderlySelfCare input[name^="eaItem"]'), function (b) {
      b.checked = false;
    });
    calcEaTotal();
  }

  /* ============================================================
     中医管理：老年人中医药健康管理服务记录表
     ------------------------------------------------------------
     量表共 33 题，每题 5 级计分：没有=1 / 很少=2 / 有时=3 / 经常=4 / 总是=5。
     题目文本严格按《老年人中医药健康管理服务记录表》原文录入。
     ============================================================ */
  /* 33 题：[主题干, 括号补充说明（可为空）] —— 依设计稿原文录入 */
  var ETS_ITEMS = [
    ['您精力充沛吗？', '（指精神头足，乐于做事）'],
    ['您容易疲乏吗？', '（指体力如何，是否稍微活动一下或做一点家务劳动就感到累）'],
    ['您容易气短、呼吸短促，接不上气吗？', ''],
    ['您说话声音低弱无力吗？', '（指说话没有力气）'],
    ['您感到闷闷不乐、情绪低沉吗？', '（指心情不愉快，情绪低落）'],
    ['您容易精神紧张、焦虑不安吗？', '（指遇事是否心情紧张）'],
    ['您因为生活状态改变而感到孤独、失落吗？', ''],
    ['您容易感到害怕或受到惊吓吗？', ''],
    ['您感到身体超重不轻松吗?', '（感觉身体沉重）BMI 指数=体重（kg）/身高 2（m）'],
    ['您眼睛干涩吗？', ''],
    ['您手脚发凉吗？', '（不包括因周围温度过低或穿的少导致的手脚发凉）'],
    ['您胃脘部、背部或腰膝部怕冷吗？', '（指上腹、背部、腰部或膝关节等，有一处或多处怕冷）'],
    ['您比一般人耐受不了寒冷吗？', '（指比别人更怕寒凉或是夏天的冷空调、电扇等）'],
    ['您容易患感冒吗？', '（指每年感冒的次数）'],
    ['您没有感冒时也会鼻塞、流鼻涕吗？', ''],
    ['您有口粘口腻，或睡眠打鼾吗？', ''],
    ['您容易过敏（对药物、食物、气味、花粉或在季节交替、气候变化时）吗？', ''],
    ['您的皮肤容易起荨麻疹吗？', '（包括风团、风疹块、风疙瘩）'],
    ['您的皮肤在不知不觉中会出现青紫瘀斑、皮下出血吗？', '（指皮肤在没有外伤的情况下出现青一块紫一块的情况）'],
    ['您的皮肤一抓就红，并出现抓痕吗？', '（指被指甲或钝物划过后皮肤的反应）'],
    ['您皮肤或口唇干吗？', ''],
    ['您有肢体麻或固定部位疼痛的感觉吗？', ''],
    ['您面部或鼻部有油腻感或者油亮发光吗？', '（指脸上或鼻子）'],
    ['您面色或目眶晦黯，或出现褐色斑块/斑点吗？', ''],
    ['您有皮肤湿疹、疮疖吗？', ''],
    ['您感到口干咽燥、总想喝水吗？', ''],
    ['您感到口苦或嘴里有异味吗？', '（指口苦或口臭）'],
    ['您腹部肥大吗？', '（指腹部脂肪肥厚）'],
    ['您吃(喝)凉的东西会感到不舒服或者怕吃(喝)凉的东西吗？', '（指不喜欢吃凉的食物，或吃了凉的食物后会不舒服）'],
    ['您有大便黏滞不爽、解不尽的感觉吗？', '（大便容易粘在马桶上）'],
    ['您容易大便干燥吗？', ''],
    ['您舌苔厚腻或有舌苔厚厚的感觉吗？', '（如果自我感觉不清楚可由调查员观察后填写）'],
    ['您舌下静脉瘀紫或增粗吗？', '（可由调查员观察后填写）']
  ];
  /* 每题 5 级选项：没有 / 很少 / 有时 / 经常 / 总是（含括号补充说明） */
  var ETS_LEVELS = [
    { v: 1, t: '没有', s: '（根本不/从来没有）' },
    { v: 2, t: '很少', s: '（有一点/偶尔）' },
    { v: 3, t: '有时', s: '（有些/少数时间）' },
    { v: 4, t: '经常', s: '（相当/多数时间）' },
    { v: 5, t: '总是', s: '（非常/每天）' }
  ];
  /* 第 9 题（BMI）、第 14 题（感冒次数）、第 17 题（过敏次数）、第 28 题（腹围）有专属的选项第二行说明 */
  var ETS_SPECIAL = {
    9:  ['（BMI＜24）', '（24≤BMI＜25）', '（25≤BMI＜26）', '（26≤BMI＜28）', '（BMI≥28）'],
    14: ['一年＜2次', '一年感冒 2-4 次', '一年感冒 5-6 次', '一年感冒 8 次以上', '几乎每月都感冒'],
    17: ['从来没有', '一年 1、2 次', '一年 3、4 次', '一年 5、6 次', '每次遇到上述原因都过敏'],
    28: ['（腹围＜80cm，相当于 2.4 尺）', '（腹围 80-85cm，2.4-2.55 尺）', '（腹围 86-90cm，2.56-2.7 尺）', '（腹围 91-105cm，2.71-3.15 尺）', '（腹围＞105cm，3.15 尺）']
  };
  /* 体质辨识结果表：列顺序与设计稿一致（平和质在最后一列） */
  var ETS_COLS = ['气虚质', '阳虚质', '阴虚质', '痰湿质', '湿热质', '血瘀质', '气郁质', '特禀质', '平和质'];
  /* 九种体质（全量，用于保健指导行） */
  var ETS_TYPES = ['气虚质', '阳虚质', '阴虚质', '痰湿质', '湿热质', '血瘀质', '气郁质', '特禀质', '平和质'];
  /* 中医药保健指导六个选项 */
  var ETS_GUIDES = ['情志调摄', '饮食调养', '起居调摄', '运动保健', '穴位保健', '其他'];

  /* ============================================================
     体质判定标准（来源：《老年人中医药健康管理服务记录表及体质判定标准表》）
     八种偏颇体质：各条目得分相加 ≥11 分「是」；9～10 分「倾向是」；≤8 分「否」
     平和质：条目 (1)(2)(4)(5)(13)，其中 (2)(4)(5)(13) 反向计分（1↔5、2↔4、3↔3）
            原始分 ≥17 分且其他 8 种体质得分都 ＜8 分 →「是」
            原始分 ≥17 分且其他 8 种体质得分都 ＜10 分 →「基本是」
            不满足上述条件者 →「否」
     ============================================================ */
  var ETS_BIAS_MAP = [
    { n: '气虚质', q: [2, 3, 4, 14] },
    { n: '阳虚质', q: [11, 12, 13, 29] },
    { n: '阴虚质', q: [10, 21, 26, 31] },
    { n: '痰湿质', q: [9, 16, 28, 32] },
    { n: '湿热质', q: [23, 25, 27, 30] },
    { n: '血瘀质', q: [19, 22, 24, 33] },
    { n: '气郁质', q: [5, 6, 7, 8] },
    { n: '特禀质', q: [15, 17, 18, 20] }
  ];
  var ETS_PEACE_ITEMS = [1, 2, 4, 5, 13];
  var ETS_PEACE_REVERSE = [2, 4, 5, 13];
  /* 各偏颇体质初始得分（设计稿演示：痰湿质 5 分，其余 0 分） */
  var ETS_MOCK_SCORES = { 气虚质: 0, 阳虚质: 0, 阴虚质: 0, 痰湿质: 5, 湿热质: 0, 血瘀质: 0, 气郁质: 0, 特禀质: 0, 平和质: 0 };
  /* 中医药保健方法富文本工具栏 */
  var ETS_TOOLS = [
    { c: 'H', t: '标题', cmd: 'formatBlock', v: '<h4>', w: 'bold' },
    { c: 'B', t: '加粗', cmd: 'bold', w: 'bold' },
    { c: 'I', t: '斜体', cmd: 'italic', w: 'italic' },
    { c: 'U', t: '下划线', cmd: 'underline', w: 'underline' },
    { c: 'S', t: '删除线', cmd: 'strikeThrough', w: 'line-through' },
    { c: '•', t: '无序列表', cmd: 'insertUnorderedList' },
    { c: '≣', t: '有序列表', cmd: 'insertOrderedList' },
    { c: '⤺', t: '撤销', cmd: 'undo' },
    { c: '⤻', t: '重做', cmd: 'redo' }
  ];
  var ETS_ARCH_NO = '321012103103000004';

  /* 渲染 33 道题（表单式列表）+ 保健指导行 + 保健方法工具栏 */
  function etsBuild() {
    var list = $('etsList');
    if (list) {
      var html = '';
      ETS_ITEMS.forEach(function (it, i) {
        var no = i + 1, q = it[0], sub = it[1];
        html += '<div class="ets-q">'
          + '<div class="ets-q-title"><i class="ets-q-star">*</i><span class="ets-q-no">' + no + '、</span>'
          + '<span class="ets-q-main">' + q + '</span>'
          + (sub ? '<span class="ets-q-sub">' + sub + '</span>' : '')
          + '</div>'
          + '<div class="ets-opts">';
        var labels = ETS_SPECIAL[no];
        ETS_LEVELS.forEach(function (lv, k) {
          html += '<label class="ets-opt"><input type="radio" name="etsQ' + no + '" value="' + lv.v
            + '" onclick="etsCalcScore()"><span class="opt-box">'
            + '<span class="opt-txt">' + lv.t + lv.s + '</span>'
            + (labels ? '<span class="opt-sub2">' + labels[k] + '</span>' : '')
            + '</span></label>';
        });
        html += '</div></div>';
      });
      list.innerHTML = html;
    }

    /* 体质辨识结果表：九列，「得分 / 体质辨识结果」由 33 题自动计算 */
    ETS_COLS.forEach(function (t, i) {
      var h = $('etsJtH' + i);
      if (h) h.textContent = t;
    });

    /* 中医药保健指导：九行，每行六个多选框 */
    var gb = $('etsGuideBody');
    if (gb) {
      gb.innerHTML = ETS_TYPES.map(function (t, i) {
        return '<tr><td class="ets-gt-lb">' + t + '</td><td><div class="ets-gt-chks">'
          + ETS_GUIDES.map(function (g, k) {
              return '<label class="chk"><input type="checkbox" name="etsGuide' + i + '" value="' + g + '">' + g + '</label>';
            }).join('')
          + '</div></td></tr>';
      }).join('');
    }

    /* 中医药保健方法：工具栏 */
    var bar = $('etsEditBar');
    if (bar) {
      bar.innerHTML = ETS_TOOLS.map(function (o) {
        return '<button type="button" class="ets-edit-btn" title="' + o.t + '"'
          + (o.w ? ' style="font-weight:' + o.w + '"' : '')
          + ' onmousedown="event.preventDefault()" onclick="etsEditCmd(\'' + o.cmd + '\',\'' + (o.v || '') + '\')">' + o.c + '</button>';
      }).join('');
    }
    etsCalcScore();
  }

  function etsEditCmd(cmd, v) {
    var box = $('etsEditBody');
    if (!box) return;
    box.focus();
    try { document.execCommand(cmd, false, v || null); } catch (e) {}
  }

  /* 读取某题当前得分；未作答返回 null */
  function etsQScore(no) {
    var el = document.querySelector('input[name="etsQ' + no + '"]:checked');
    return el ? (parseInt(el.value, 10) || 0) : null;
  }

  /* 反向计分：1↔5、2↔4、3↔3、4↔2、5↔1 */
  function etsReverse(v) { return 6 - v; }

  /* 依《体质判定标准表》计算九种体质得分与判定结果
     返回 { 气虚质: {score, result, ready}, …, 平和质: {…} } */
  function etsJudgeAll() {
    var out = {}, answers = [], i;
    for (i = 1; i <= ETS_ITEMS.length; i++) answers[i] = etsQScore(i);
    var ready = answers.every(function (v) { return v !== null; });

    /* 八种偏颇体质：条目得分直接相加 */
    ETS_BIAS_MAP.forEach(function (g) {
      var s = 0, miss = 0;
      g.q.forEach(function (no) {
        if (answers[no] === null) { miss++; } else { s += answers[no]; }
      });
      var r = '否';
      if (!miss) r = s >= 11 ? '是' : (s >= 9 ? '倾向是' : '否');
      out[g.n] = { score: s, result: r, ready: miss === 0 };
    });

    /* 平和质：原始分（(2)(4)(5)(13) 反向计分） */
    var ps = 0, pmiss = 0;
    ETS_PEACE_ITEMS.forEach(function (no) {
      var v = answers[no];
      if (v === null) { pmiss++; return; }
      ps += (ETS_PEACE_REVERSE.indexOf(no) >= 0) ? etsReverse(v) : v;
    });
    /* 其他 8 种体质得分 */
    var others = [], omax = 0;
    ETS_BIAS_MAP.forEach(function (g) { others.push(out[g.n].score); if (out[g.n].score > omax) omax = out[g.n].score; });
    var maxBias = Math.max.apply(null, others);
    var pr = '否';
    if (pmiss === 0) {
      if (ps >= 17 && maxBias < 8) pr = '是';
      else if (ps >= 17 && maxBias < 10) pr = '基本是';
    }
    out['平和质'] = { score: ps, result: pr, ready: pmiss === 0 };
    out._ready = ready;
    return out;
  }

  /* 得分 + 体质辨识结果：由 33 题自动计算并回填表格 */
  function etsCalcScore() {
    var total = 0, done = 0;
    ETS_ITEMS.forEach(function (q, i) {
      var el = document.querySelector('input[name="etsQ' + (i + 1) + '"]:checked');
      if (el) { total += parseInt(el.value, 10) || 0; done++; }
    });

    var r = etsJudgeAll();
    ETS_COLS.forEach(function (t, i) {
      var c = $('etsJtS' + i);
      var cell = $('etsJtR' + i);
      var info = r[t] || { score: 0, result: '否', ready: false };
      /* 未作答完毕时，得分按 0 显示（与设计稿一致） */
      if (c) c.textContent = info.ready ? info.score : 0;
      if (cell) {
        var v = info.ready ? info.result : '否';
        cell.textContent = v;
        cell.style.color = v === '否' ? '#52C41A' : (v === '是' ? '#389E0D' : '#D48806');
        cell.style.fontWeight = v === '否' ? '400' : '600';
      }
    });
    return total;
  }

  /* 顶部「姓名 / 档案编号 / 出生日期」按居民档案预填 */
  function etsFillHead() {
    var t = $('etsNameTxt'), a = $('etsArchNo'), b = $('etsBirthTxt');
    if (t) t.textContent = P.name;
    if (a) a.textContent = QS.get('archNo') || ETS_ARCH_NO;
    if (b) b.textContent = P.birth || '--';
  }

  /* 体质辨识结果：自动计算所得且非「否」的体质，返回如 ["痰湿质 是"] */
  function etsCheckedTypes() {
    var r = etsJudgeAll(), out = [];
    ETS_COLS.forEach(function (t) {
      var info = r[t];
      if (info && info.ready && info.result !== '否') out.push(t + ' ' + info.result);
    });
    return out;
  }

  /* 已勾选保健指导：（体质 → 选项数组） */
  function etsCheckedGuides() {
    var out = [];
    ETS_TYPES.forEach(function (t, i) {
      var sel = document.querySelectorAll('input[name="etsGuide' + i + '"]:checked');
      var arr = [];
      Array.prototype.forEach.call(sel, function (b) { arr.push(b.value); });
      if (arr.length) out.push(t + '：' + arr.join('、'));
    });
    return out;
  }

  function saveElderTcmService() {
    var missing = wmMissing([
      { t: 'val', id: 'etsDoctor', label: '测评医师' },
      { t: 'val', id: 'etsDate', label: '测评日期' }
    ]);
    if (missing.length) { toast('请完善必填项：' + missing.join('、'), 'warning'); return; }
    var undone = [];
    ETS_ITEMS.forEach(function (q, i) {
      if (!document.querySelector('input[name="etsQ' + (i + 1) + '"]:checked')) undone.push(i + 1);
    });
    if (undone.length) { toast('请完成第 ' + undone.join('、') + ' 题的作答', 'warning'); return; }
    var types = etsCheckedTypes();
    var guides = etsCheckedGuides();
    wmToastSaved('保存成功：体质辨识结果 ' + (types.length ? types.join('；') : '平和（无偏颇体质）')
      + (guides.length ? '；保健指导 ' + guides.join('；') : ''));
  }

  function mockElderTcmService() {
    etsFillHead();
    setVal('etsDoctor', '吕雪');
    setVal('etsDate', '2026-09-22');
    /* 设计稿演示：量表未作答、得分 0、九种体质结果均为「否」 */
    Array.prototype.forEach.call(document.querySelectorAll('#viewElderTcmService input[name^="etsQ"]'), function (b) {
      b.checked = false;
    });
    etsCalcScore();
  }

  /* ================= 中医管理：中医健康指导 ================= */
  var TCG_ARCH_NO = '32101211811812487';
  function tcgFillHead() {
    var t = $('tcgNameTxt'), a = $('tcgArchNo'), g = $('tcgGenderTxt');
    var b = $('tcgBirthTxt'), id = $('tcgIdcardTxt'), p = $('tcgPhoneTxt');
    if (t) t.textContent = P.name;
    if (a) a.textContent = QS.get('archNo') || TCG_ARCH_NO;
    if (g) g.textContent = P.gender || '--';
    if (b) b.textContent = P.birth || '--';
    if (id) id.textContent = P.idcard || '--';
    if (p) p.textContent = P.phone || '--';
  }
  /* 字数计数（独立实现，避免与 msCount 耦合） */
  function tcgCount(el, cntId) {
    var c = $(cntId);
    if (c && el) c.textContent = el.value.length + '/' + (el.maxLength > 0 ? el.maxLength : 200);
  }
  /* 取某组选中值：多选返回数组 */
  function tcgChecked(name) {
    var list = document.querySelectorAll('#viewTcmGuide input[name="' + name + '"]:checked');
    return Array.prototype.map.call(list, function (b) { return b.value; });
  }
  function saveTcmGuide() {
    var missing = wmMissing([
      { t: 'val', id: 'tcgDoctor', label: '指导医师' },
      { t: 'val', id: 'tcgDate', label: '评估日期' }
    ]);
    if (missing.length) { toast('请完善必填项：' + missing.join('、'), 'warning'); return; }
    var groups = tcgChecked('tcgGroup');
    if (!groups.length) { toast('请至少选择一项人群分类', 'warning'); return; }
    var types = tcgChecked('tcgType');
    var health = tcgChecked('tcgHealth');
    wmToastSaved('保存成功：人群分类 ' + groups.join('、')
      + (types.length ? '；体质判定 ' + types.join('、') : '')
      + (health.length ? '；健康状况 ' + health.join('、') : ''));
  }
  function mockTcmGuide() {
    tcgFillHead();
    setVal('tcgDoctor', '吕雪');
    setVal('tcgDate', '2026-09-27');
    var ta = $('tcgSummary');
    if (ta) { ta.value = ''; tcgCount(ta, 'tcgSummaryCnt'); }
  }

  /* ================= 残疾人管理：残疾人基本信息 ================= */
  var DIS_ARCH_NO = '3210121000011203';
  function disFillHead() {
    var t = $('disNameTxt'), a = $('disArchNo');
    if (t) t.textContent = P.name;
    if (a) a.textContent = QS.get('archNo') || DIS_ARCH_NO;
  }
  function saveDisability() {
    var missing = wmMissing([
      { t: 'radio', name: 'disLowIncome', label: '是否领取低保' },
      { t: 'radio', name: 'disCause', label: '病因' },
      { t: 'val', id: 'disCreateOrg', label: '建档机构' },
      { t: 'val', id: 'disDoctor', label: '责任医生' },
      { t: 'val', id: 'disCreateDoc', label: '建档医生' }
    ]);
    if (missing.length) { toast('请完善必填项：' + missing.join('、'), 'warning'); return; }
    disFillHead();
    wmToastSaved('保存成功：残疾人基本信息已保存');
  }
  function mockDisability() {
    disFillHead();
    /* 设计稿：是否领取低保 / 病因 / 是否需要康复 三组均未勾选，签名与备注留空 */
    Array.prototype.forEach.call(document.querySelectorAll('#viewDisability input[type="radio"]'), function (b) {
      b.checked = false;
    });
    setVal('disSign', '');
    setVal('disRemark', '');
    msCount($('disRemark'), 'disRemarkCnt');
    setVal('disCreateOrg', '扬州市江都区丁伙镇卫生院');
    setVal('disDoctor', '顾婷婷');
    setVal('disCreateDate', '2026-09-22');
    setVal('disCreateDoc', '顾婷婷');
  }

  /* ================= 健康体检：五页合并长表单 + 右侧锚点定位 ================= */
  var HC_ARCH_NO = '3210121000011008';
  function hcFillHead() {
    var t = $('hcNameTxt'), a = $('hcArchNo');
    if (t) t.textContent = P.name;
    if (a) a.textContent = QS.get('archNo') || HC_ARCH_NO;
  }
  /* 体质指数 BMI 自动计算（身高 cm / 体重 kg）—— 与高血压专项表同一算法 */
  function hcCalcBmi() {
    var h = parseFloat(($('hcHeight') || {}).value);
    var w = parseFloat(($('hcWeight') || {}).value);
    var box = $('hcBmi');
    if (!box) return;
    box.value = (h > 0 && w > 0) ? (w / ((h / 100) * (h / 100))).toFixed(1) : '';
  }
  function hcRadioVal(name) {
    var el = document.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : '';
  }
  /* 灰底 = 设计稿中「父级选择为否/未选」而被禁用的字段，故禁用态同步加 .gray */
  function hcDisableInput(id, on) {
    var e = $(id);
    if (!e) return;
    e.disabled = !!on;
    e.classList.toggle('gray', !!on);
  }
  function hcDisableBox(boxId, on) {
    var box = $(boxId);
    if (!box) return;
    Array.prototype.forEach.call(box.querySelectorAll('input'), function (b) {
      b.disabled = !!on;
      if (on) b.checked = false;
    });
  }
  /* 吸烟情况 → 日吸烟量 / 开始吸烟年龄 / 戒烟年龄 */
  function hcSyncSmoke() {
    var v = hcRadioVal('hcSmoke');
    hcDisableInput('hcSmokeDaily', v !== '吸烟');
    hcDisableInput('hcSmokeStart', v !== '吸烟');
    hcDisableInput('hcSmokeQuit', v !== '已戒烟');
  }
  /* 锻炼频率 → 每次锻炼时间 / 坚持锻炼时间 / 锻炼方式 */
  function hcSyncExercise() {
    var v = hcRadioVal('hcExFreq');
    var on = (v === '' || v === '不锻炼');
    hcDisableInput('hcExTime', on);
    hcDisableInput('hcExYears', on);
    hcDisableInput('hcExWay', on);
  }
  /* 饮酒频率 → 日饮酒量 / 开始饮酒年龄 / 近一年是否醉酒 / 是否戒酒 / 饮酒种类 */
  function hcSyncDrink() {
    var off = hcRadioVal('hcDrinkFreq') === '从不';
    hcDisableInput('hcDrinkDaily', off);
    hcDisableInput('hcDrinkStart', off);
    hcDisableBox('hcDrunkBox', off);
    hcDisableBox('hcQuitBox', off);
    hcDisableBox('hcDrinkKindBox', off);
  }
  /* 有无接触史 → 工种 / 从业时间 / 毒物种类各输入框与防护措施 */
  function hcSyncOcc() {
    var off = hcRadioVal('hcExposure') === '无';
    ['hcOccTrade', 'hcOccYears', 'hcOccDust', 'hcOccRay', 'hcOccPhy', 'hcOccChem', 'hcOccOther']
      .forEach(function (id) { hcDisableInput(id, off); });
    ['hcProtDust', 'hcProtRay', 'hcProtPhy', 'hcProtChem', 'hcProtOther']
      .forEach(function (b) { hcDisableBox(b, off); });
  }
  function hcSyncAll() {
    hcSyncSmoke();
    hcSyncExercise();
    hcSyncDrink();
    hcSyncOcc();
    hcCalcBmi();
    hcSyncRail();
  }
  /* 右侧锚点：点击跳转
     显式滚动 #pvContent（内容区才是滚动容器），不用 scrollIntoView —— 后者会
     连带滚动所有可滚动祖先，且 block:'start' 会把行顶到滚动口最上沿、被 16px 内边距吃掉。 */
  function hcJump(id, el) {
    var tr = $(id), box = $('pvContent');
    if (tr && box) {
      var padTop = parseFloat(getComputedStyle(box).paddingTop) || 0;
      var top = tr.getBoundingClientRect().top - box.getBoundingClientRect().top
                + box.scrollTop - padTop;
      if (top < 0) top = 0;
      try { box.scrollTo({ top: top, behavior: 'smooth' }); }
      catch (e) { box.scrollTop = top; }
    } else if (tr) {
      tr.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    var rail = $('hcRail');
    if (rail) {
      Array.prototype.forEach.call(rail.querySelectorAll('a'), function (a) {
        a.classList.toggle('active', a === el);
      });
    }
  }
  /* 右侧锚点：滚动联动高亮（取当前视口顶端最近的区块） */
  function hcSyncRail() {
    var rail = $('hcRail');
    var box = $('pvContent');
    if (!rail || !box || $('viewHealthCheckup').classList.contains('hidden')) return;
    var links = rail.querySelectorAll('a');
    // 基准线取「内容区可视顶沿 + 内边距」：含 16px padding-top，否则贴顶的行算不到
    var padTop = parseFloat(getComputedStyle(box).paddingTop) || 0;
    var base = box.getBoundingClientRect().top + padTop;
    var idx = 0;
    for (var i = 0; i < links.length; i++) {
      var tr = $(links[i].getAttribute('data-sec'));
      if (!tr) continue;
      if (tr.getBoundingClientRect().top - base <= 8) idx = i;
    }
    // 滚到底：末节因滚动钳制无法贴顶，此时应高亮最后一节而非回退
    if (box.scrollTop + box.clientHeight >= box.scrollHeight - 2) {
      for (var k = links.length - 1; k >= 0; k--) {
        if ($(links[k].getAttribute('data-sec'))) { idx = k; break; }
      }
    }
    Array.prototype.forEach.call(links, function (a, i) {
      a.classList.toggle('active', i === idx);
    });
  }
  function hcBindRail() {
    var rail = $('hcRail'), box = $('pvContent');
    if (!rail || !box) return;
    Array.prototype.forEach.call(rail.querySelectorAll('a'), function (a) {
      var oc = a.getAttribute('onclick') || '';
      var m = oc.match(/hcJump\('([^']+)'/);
      if (m) a.setAttribute('data-sec', m[1]);
    });
    box.addEventListener('scroll', function () {
      if ($('viewHealthCheckup').classList.contains('hidden')) return;
      if (hcBindRail._t) return;
      hcBindRail._t = setTimeout(function () { hcBindRail._t = 0; hcSyncRail(); }, 60);
    });
  }
  /* 主要药物情况：新增一条用药（原型演示：清空当前行） */
  function hcAddDrug() {
    ['hcDrugName', 'hcDrugBrand', 'hcDrugUsage', 'hcDrugDose1', 'hcDrugDose2',
     'hcDrugDose3', 'hcDrugDays', 'hcDrugComply', 'hcDrugClass', 'hcDrugRemark']
      .forEach(function (id) { setVal(id, ''); });
    toast('已新增一条用药记录', 'success');
  }
  /* 健康评价：生成评价 */
  function hcGenEval() {
    hcCalcBmi();
    var bmi = parseFloat($('hcBmi').value);
    var txt = '未见异常';
    if (!isNaN(bmi) && bmi >= 24) txt = '超重';
    toast('已根据本次体检结果生成评价：' + txt, 'success');
  }
  function collectHcChecked(name) {
    return Array.prototype.map.call(
      document.querySelectorAll('input[name="' + name + '"]:checked'),
      function (b) { return b.value; });
  }
  function saveHealthCheckup() {
    var missing = wmMissing([
      { t: 'val', id: 'hcOrg', label: '体检机构' },
      { t: 'val', id: 'hcExamDate', label: '体检日期' },
      { t: 'val', id: 'hcDoctor', label: '体检医生' },
      { t: 'val', id: 'hcDutyDoctor', label: '责任医生' },
      { t: 'val', id: 'hcTemp', label: '体温' },
      { t: 'val', id: 'hcPulse', label: '脉率' },
      { t: 'val', id: 'hcBreath', label: '呼吸频率' },
      { t: 'val', id: 'hcHeight', label: '身高' },
      { t: 'val', id: 'hcWeight', label: '体重' },
      { t: 'val', id: 'hcWaist', label: '腰围' },
      { t: 'val', id: 'hcSbpL', label: '左侧收缩压' },
      { t: 'val', id: 'hcDbpL', label: '左侧舒张压' },
      { t: 'val', id: 'hcSbpR', label: '右侧收缩压' },
      { t: 'val', id: 'hcDbpR', label: '右侧舒张压' },
      { t: 'val', id: 'hcHeartRate', label: '心率' },
      { t: 'val', id: 'hcSightL', label: '左眼视力' },
      { t: 'val', id: 'hcSightR', label: '右眼视力' },
      { t: 'radio', name: 'hcExFreq', label: '锻炼频率' },
      { t: 'radio', name: 'hcRhythm', label: '心律' }
    ]);
    if (missing.length) { toast('请完善必填项：' + missing.join('、'), 'warning'); return; }
    hcFillHead();
    wmToastSaved('保存成功：健康体检记录已保存');
  }
  function mockHealthCheckup() {
    hcFillHead();
    setVal('hcOrg', '山东大学齐鲁医院');
    setVal('hcExamDate', '2026-09-23');
    setVal('hcDoctor', '吕雪');
    setVal('hcDutyDoctor', '吕雪');
    toggleHcChk('hcSym', ['无症状', '头痛', '头晕']);
    toggleHcChk('hcDiet', ['荤素均衡']);
    toggleHcChk('hcTeeth', ['正常']);
    toggleHcChk('hcRale', []);
    toggleHcChk('hcDxCerebral', ['未发现']);
    toggleHcChk('hcDxKidney', ['未发现']);
    toggleHcChk('hcDxHeart', ['未发现']);
    toggleHcChk('hcDxVessel', ['未发现']);
    toggleHcChk('hcDxEye', ['未发现']);
    toggleHcChk('hcGuide', ['建议复查']);
    toggleHcChk('hcRisk', ['戒烟', '健康饮酒', '饮食', '锻炼']);
    setVal('hcSightL', '1.0');
    setVal('hcSightR', '1.0');
    setVal('hcDrugName', '苯磺酸氨氯地平片');
    setVal('hcDrugUsage', '口服');
    setVal('hcDrugDose1', '1');
    setVal('hcDrugDose2', '5');
    setVal('hcDrugDose3', '次/日');
    setVal('hcDrugDays', '长期');
    setVal('hcDrugComply', '规律');
    setVal('hcDrugClass', '降压药');
    setVal('hcNextDate', hcNextYear());
    hcSyncAll();
  }
  function toggleHcChk(name, values) {
    var els = document.querySelectorAll('input[name="' + name + '"]');
    Array.prototype.forEach.call(els, function (b) {
      b.checked = values.indexOf(b.value) >= 0;
    });
  }
  function hcNextYear() {
    var d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    var m = String(d.getMonth() + 1); if (m.length < 2) m = '0' + m;
    var day = String(d.getDate()); if (day.length < 2) day = '0' + day;
    return d.getFullYear() + '-' + m + '-' + day;
  }

  init();
