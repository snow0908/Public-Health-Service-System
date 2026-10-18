
  /* ================= 模拟数据（姓名/证件号/出生日期/性别/年龄相互对应；重点人群类型为单字标签，未标注者个人档案情况默认正常） ================= */
  var womenData = [
    { org:'山东大学齐鲁医院', name:'李大海', idcard:'110101198005010149', idType:'居民身份证', gender:'女', age:46, phone:'13652478565', birth:'1980-05-01', marriage:'已婚', crowd:['高血压'], address:'一组2号', archNo:'32101211811812486', region:'善玉村', createDate:'2026-09-03', dutyDoc:'朱劲松', lock:'未上锁', archStatus:'已关联', mine:true },
    { org:'扬州市江都区滨江人民医院', name:'小山东高速', idcard:'510123199001010106', idType:'居民身份证', gender:'女', age:36, phone:'13899229292', birth:'1990-01-01', marriage:'已婚', crowd:['高血压'], address:'1212', archNo:'51011500100100076', region:'北街社区', createDate:'2023-04-03', dutyDoc:'朱劲松', lock:'未上锁', archStatus:'已关联', mine:false },
    { org:'扬州市江都区滨江人民医院', name:'夏余兰', idcard:'321088195803137723', idType:'居民身份证', gender:'女', age:68, phone:'15715251671', birth:'1958-03-13', marriage:'已婚', crowd:['老年人','高血压'], address:'朱家组', archNo:'3210121121200035', region:'韩阳村', createDate:'2022-09-01', dutyDoc:'朱劲松', lock:'未上锁', archStatus:'已关联', mine:false },
    { org:'山东大学齐鲁医院', name:'王秀英', idcard:'370102195403152847', idType:'居民身份证', gender:'女', age:72, phone:'13905312361', birth:'1954-03-15', marriage:'已婚', crowd:['老年人','糖尿病'], address:'济南市历下区解放路105号', archNo:'370102JM26001', region:'解放路社区', createDate:'2024-03-11', dutyDoc:'徐东升', lock:'未上锁', archStatus:'已关联', mine:true },
    { org:'山东大学齐鲁医院', name:'杨春梅', idcard:'370102198109082543', idType:'居民身份证', gender:'女', age:45, phone:'18764165283', birth:'1981-09-08', marriage:'已婚', crowd:['高血压'], address:'济南市历下区山大南路27号', archNo:'370102JM26006', region:'千佛山社区', createDate:'2024-04-15', dutyDoc:'李蕾', lock:'未上锁', archStatus:'已关联', mine:false },
    { org:'济南市市中区舜玉路社区卫生服务中心', name:'高凤仙', idcard:'370102194503124826', idType:'居民身份证', gender:'女', age:81, phone:'13626415789', birth:'1945-03-12', marriage:'丧偶', crowd:['老年人','脑卒中','高血压'], address:'济南市市中区二环南路2766号', archNo:'370102JM26017', region:'舜玉社区', createDate:'2024-05-21', dutyDoc:'敖鹏天', lock:'未上锁', archStatus:'未关联', mine:false },
    { org:'山东大学齐鲁医院', name:'韩淑芬', idcard:'370102195912034420', idType:'居民身份证', gender:'女', age:66, phone:'13370583146', birth:'1959-12-03', marriage:'离婚', crowd:['老年人','慢阻肺病'], address:'济南市历下区燕山小区南路8号', archNo:'370102JM26021', region:'燕山社区', createDate:'2024-06-03', dutyDoc:'陆柳琳', lock:'未上锁', archStatus:'已关联', mine:true },
    { org:'济南市市中区舜玉路社区卫生服务中心', name:'白淑珍', idcard:'370102194804304428', idType:'居民身份证', gender:'女', age:78, phone:'13064019573', birth:'1948-04-30', marriage:'已婚', crowd:['老年人','糖尿病'], address:'济南市市中区六里山南路20号', archNo:'370103JM26029', region:'舜玉社区', createDate:'2024-09-10', dutyDoc:'敖鹏天', lock:'未上锁', archStatus:'已关联', mine:false },
    { org:'济南市历下区甸柳新村社区卫生服务中心', name:'董梅香', idcard:'370102196705244824', idType:'居民身份证', gender:'女', age:59, phone:'15863770125', birth:'1967-05-24', marriage:'已婚', crowd:['高血压'], address:'济南市历下区甸柳新村七区3号楼', archNo:'370102JM26023', region:'甸柳社区', createDate:'2024-06-30', dutyDoc:'王盛', lock:'未上锁', archStatus:'已关联', mine:true },
    { org:'济南市天桥区工人新村社区卫生服务中心', name:'潘金凤', idcard:'370102196202144226', idType:'居民身份证', gender:'女', age:64, phone:'15098763214', birth:'1962-02-14', marriage:'已婚', crowd:['糖尿病'], address:'济南市天桥区堤口路92号', archNo:'370105JM26025', region:'工人新村社区', createDate:'2024-07-25', dutyDoc:'朱劲松', lock:'未上锁', archStatus:'已关联', mine:false },
    { org:'济南市历下区文化东路社区卫生服务中心', name:'邵玉洁', idcard:'370102197006084824', idType:'居民身份证', gender:'女', age:56, phone:'15562593049', birth:'1970-06-08', marriage:'未婚', crowd:['高血压'], address:'济南市历下区文化东路51号', archNo:'370102JM26027', region:'文化东路社区', createDate:'2024-08-19', dutyDoc:'李蕾', lock:'未上锁', archStatus:'已关联', mine:false },
    { org:'济南市历下区甸柳新村社区卫生服务中心', name:'罗建萍', idcard:'370102196303184426', idType:'居民身份证', gender:'女', age:63, phone:'15806604013', birth:'1963-03-18', marriage:'已婚', crowd:['慢阻肺病'], address:'济南市历下区甸柳新村二区4号楼', archNo:'370102JM26031', region:'甸柳社区', createDate:'2024-10-08', dutyDoc:'陆柳琳', lock:'未上锁', archStatus:'已关联', mine:true },
    { org:'济南市历下区千佛山社区卫生服务中心', name:'万秀琴', idcard:'370103195505214824', idType:'居民身份证', gender:'女', age:71, phone:'15165374029', birth:'1955-05-21', marriage:'丧偶', crowd:['老年人','冠心病'], address:'济南市历下区文化东路88号', archNo:'370102JM26033', region:'文化东路社区', createDate:'2024-11-02', dutyDoc:'李蕾', lock:'未上锁', archStatus:'未关联', mine:false },
    { org:'济南市天桥区工人新村社区卫生服务中心', name:'尹桂芳', idcard:'370102196610154826', idType:'居民身份证', gender:'女', age:59, phone:'15066651730', birth:'1966-10-15', marriage:'离婚', crowd:['高血压','糖尿病'], address:'济南市天桥区工人新村北街7号', archNo:'370105JM26035', region:'工人新村社区', createDate:'2024-11-28', dutyDoc:'王盛', lock:'未上锁', archStatus:'已关联', mine:true },
    { org:'济南市市中区舜玉路社区卫生服务中心', name:'华凤英', idcard:'370102195808304420', idType:'居民身份证', gender:'女', age:68, phone:'15562588107', birth:'1958-08-30', marriage:'已婚', crowd:['老年人','高血压'], address:'济南市市中区玉函路39号', archNo:'370103JM26037', region:'舜玉社区', createDate:'2024-12-23', dutyDoc:'敖鹏天', lock:'未上锁', archStatus:'已关联', mine:false },
    { org:'济南市天桥区工人新村社区卫生服务中心', name:'汤玉珍', idcard:'370103195111234426', idType:'居民身份证', gender:'女', age:74, phone:'15589917860', birth:'1951-11-23', marriage:'丧偶', crowd:['老年人','肺结核'], address:'济南市天桥区济泺路130号', archNo:'370105JM26039', region:'工人新村社区', createDate:'2025-01-19', dutyDoc:'朱劲松', lock:'未上锁', archStatus:'已关联', mine:true }
  ];

  /* ================= 工具函数 ================= */
  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function $(id) { return document.getElementById(id); }

  /* ================= 分页状态 ================= */
  var PAGE_SIZE = 20;
  var curPage = 1;
  var lastList = [];

  /* ================= 表格渲染（按筛选条件实时过滤 + 分页） ================= */
  function renderTable() {
    var org = $('fOrg').value, name = $('fName').value.trim(), idcard = $('fIdcard').value.trim();
    var region = $('fRegion').value, lock = $('fLock').value;
    var marriage = $('fMarriage').value, crowd = $('fCrowd').value;
    var phone = $('fPhone').value.trim(), archNo = $('fArchNo').value.trim();
    var archStatus = $('fArchStatus').value;
    var birthStart = $('fBirthStart').value, birthEnd = $('fBirthEnd').value;
    var createStart = $('fCreateStart').value, createEnd = $('fCreateEnd').value;
    var own = $('fMine').checked;

    lastList = womenData.filter(function (r) {
      if (org && org.split(',').indexOf(r.org) === -1) return false;
      if (name && r.name.indexOf(name) === -1) return false;
      if (idcard && r.idcard.indexOf(idcard) === -1) return false;
      if (region && r.region !== region) return false;
      if (lock && r.lock !== lock) return false;
      if (marriage && r.marriage !== marriage) return false;
      /* 重点人群类型：多选，任一所选标签命中即通过 */
      if (crowd) {
        var cs = crowd.split(',');
        if (!cs.some(function (c) { return (r.crowd || []).indexOf(c) !== -1; })) return false;
      }
      if (phone && r.phone.indexOf(phone) === -1) return false;
      if (archNo && r.archNo.indexOf(archNo) === -1) return false;
      if (archStatus && (r.archStatus || '已关联') !== archStatus) return false;
      if (birthStart && r.birth < birthStart) return false;
      if (birthEnd && r.birth > birthEnd) return false;
      if (createStart && r.createDate < createStart) return false;
      if (createEnd && r.createDate > createEnd) return false;
      if (own && !r.mine) return false;
      return true;
    });

    var total = Math.max(1, Math.ceil(lastList.length / PAGE_SIZE));
    if (curPage > total) curPage = total;
    var start = (curPage - 1) * PAGE_SIZE;
    var slice = lastList.slice(start, start + PAGE_SIZE);

    var crowdMap = { '高血压':'yun', '糖尿病':'can', '慢阻肺病':'di', '老年人':'te', '肺结核':'jing', '严重精神障碍':'jie', '脑卒中':'lao', '冠心病':'guan' };
    var html = '';
    if (slice.length === 0) {
      html = '<tr class="empty-row"><td colspan="18"><div class="ico">📭</div>暂无符合条件的妇女管理档案</td></tr>';
    } else {
      slice.forEach(function (r, i) {
        var lkDot = r.lock === '未上锁' ? 'ok' : 'warn';
        var crowdHtml = '';
        (r.crowd || []).forEach(function (c) {
          if (crowdMap[c]) crowdHtml += '<span class="crowd-tag ' + crowdMap[c] + '">' + c + '</span>';
        });
        html += '<tr>'
          + '<td class="center">' + (start + i + 1) + '</td>'
          + '<td title="' + esc(r.org) + '"><span class="cell">' + esc(r.org) + '</span></td>'
          + '<td><a class="op-link" onclick="goArchive(\'' + esc(r.archNo) + '\')" title="查看妇女档案">' + esc(r.name) + '</a></td>'
          + '<td title="' + esc(r.idcard) + '"><span class="cell">' + esc(r.idcard) + '</span></td>'
          + '<td>' + esc(r.idType) + '</td>'
          + '<td class="center">' + esc(r.gender) + '</td>'
          + '<td class="center">' + r.age + '</td>'
          + '<td>' + esc(r.birth) + '</td>'
          + '<td>' + esc(r.marriage || '') + '</td>'
          + '<td><span class="crowd-tags">' + crowdHtml + '</span></td>'
          + '<td title="' + esc(r.phone) + '"><span class="cell">' + esc(r.phone) + '</span></td>'
          + '<td title="' + esc(r.address) + '"><span class="cell">' + esc(r.address) + '</span></td>'
          + '<td title="' + esc(r.archNo) + '"><span class="cell">' + esc(r.archNo) + '</span></td>'
          + '<td>' + esc(r.region) + '</td>'
          + '<td>' + esc(r.createDate) + '</td>'
          + '<td>' + esc(r.dutyDoc) + '</td>'
          + '<td><span class="st-dot ' + lkDot + '"></span>' + esc(r.lock) + '</td>'
          + '<td class="center">'
          +   '<a class="op-link" onclick="goArchive(\'' + esc(r.archNo) + '\')">编辑</a>'
          +   '<span class="op-gap"></span>'
          +   '<span class="op-more">'
          +     '<a class="more-btn" onclick="showOpMenu(this,event,\'' + esc(r.archNo) + '\')">新建服务<svg viewBox="0 0 24 24" style="width:10px;height:10px;fill:none;stroke:currentColor;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round"><polyline points="6 9 12 15 18 9"/></svg></a>'
          +   '</span>'
          +   '<span class="op-gap"></span>'
          +   '<a class="op-link" style="color:#FF4D4F" onclick="opAction(\'注销\',\'' + esc(r.name) + '\')">注销</a>'
          + '</td>'
          + '</tr>';
      });
    }
    $('tbBody').innerHTML = html;
    $('pgTotal').textContent = lastList.length;
    renderPager(total);
    $('pgJump').value = curPage;
  }

  /* ================= 分页器 ================= */
  function renderPager(total) {
    var nums = [];
    if (total <= 7) {
      for (var i = 1; i <= total; i++) nums.push(i);
    } else {
      nums.push(1);
      if (curPage > 3) nums.push('…');
      for (var j = Math.max(2, curPage - 1); j <= Math.min(total - 1, curPage + 1); j++) nums.push(j);
      if (curPage < total - 2) nums.push('…');
      nums.push(total);
    }
    var h = '<button class="pg-btn" onclick="gotoPage(' + (curPage - 1) + ')">‹</button>';
    nums.forEach(function (n) {
      h += n === '…'
        ? '<span class="pg-ellipsis">…</span>'
        : '<button class="pg-btn' + (n === curPage ? ' active' : '') + '" onclick="gotoPage(' + n + ')">' + n + '</button>';
    });
    h += '<button class="pg-btn" onclick="gotoPage(' + (curPage + 1) + ')">›</button>';
    $('pgPager').innerHTML = h;
  }

  function gotoPage(p) {
    var total = Math.max(1, Math.ceil(lastList.length / PAGE_SIZE));
    if (p < 1) { toast('已是第一页', 'info'); return; }
    if (p > total) { toast('已是最后一页', 'info'); return; }
    if (p === curPage) { toast('已在第 ' + p + ' 页', 'info'); return; }
    curPage = p;
    renderTable();
  }

  function jumpPage() {
    var v = parseInt($('pgJump').value, 10);
    if (isNaN(v)) { toast('请输入页码', 'warning'); return; }
    gotoPage(v);
  }

  /* ================= 交互 ================= */
  function resetFilter() {
    ['fName', 'fIdcard', 'fArchNo', 'fPhone'].forEach(function (id) { $(id).value = ''; });
    ['fOrg', 'fRegion', 'fMarriage', 'fCrowd', 'fArchStatus', 'fLock'].forEach(function (id) { $(id).value = ''; });
    ['fBirthStart', 'fBirthEnd', 'fCreateStart', 'fCreateEnd'].forEach(function (id) { var el = $(id); el.value = ''; el.type = 'text'; });
    $('fMine').checked = false;
    curPage = 1;
    renderTable();
    toast('筛选条件已重置', 'success');
  }

  function applyFilter() {
    curPage = 1;
    renderTable();
    toast('查询完成，共 ' + $('pgTotal').textContent + ' 条记录', 'success');
  }

  function toggleExtra() {
    var rows = document.querySelectorAll('.filter-panel .filter-row.extra');
    var btn = $('btnExpand');
    var show = !rows[0].classList.contains('show');
    rows.forEach(function (row) { row.classList.toggle('show', show); });
    btn.textContent = show ? '收起 ▲' : '展开 ▼';
    /* 展开：按钮组移到最后一行筛选条件右侧；收起：移回第二行末尾 */
    var btns = document.querySelector('.filter-panel .filter-btns');
    var mainRows = document.querySelectorAll('.filter-panel .filter-row:not(.extra)');
    if (show) {
      rows[rows.length - 1].appendChild(btns);
    } else {
      mainRows[mainRows.length - 1].appendChild(btns);
    }
  }

  function showOpMenu(el, ev, archNo) {
    if (ev) ev.stopPropagation();
    closeAllOpMenus();
    var m = $('opMenu');
    if (!m) return;
    m.innerHTML =
      '<button class="mi" onclick="opAction(\'婚前医学检查\',\'' + archNo + '\')">婚前医学检查</button>' +
      '<button class="mi" onclick="opAction(\'孕前医学检查\',\'' + archNo + '\')">孕前医学检查</button>' +
      '<button class="mi" onclick="opAction(\'常见妇女病检查\',\'' + archNo + '\')">常见妇女病检查</button>' +
      '<button class="mi" onclick="opAction(\'叶酸发放登记表\',\'' + archNo + '\')">叶酸发放登记表</button>';
    m.style.display = 'block';
    var r = el.getBoundingClientRect();
    var gap = 6, top = r.bottom + gap;
    var left = r.right - m.offsetWidth;
    if (left < 8) left = r.left;
    if (left + m.offsetWidth > window.innerWidth - 8) left = window.innerWidth - m.offsetWidth - 8;
    m.style.top = top + 'px';
    m.style.left = left + 'px';
  }

  function closeAllOpMenus() {
    var m = $('opMenu');
    if (m) { m.style.display = 'none'; m.innerHTML = ''; }
  }

  function opAction(action, key) {
    closeAllOpMenus();
    if (action === '注销') { toast('注销：' + key + '（功能建设中）', 'info'); return; }
    var viewMap = {
      '婚前医学检查': 'preMarital',
      '孕前医学检查': 'prePregnancy',
      '常见妇女病检查': 'womanDisease',
      '叶酸发放登记表': 'folicAcid'
    };
    var view = viewMap[action];
    if (!view) { toast(action + '：功能建设中', 'info'); return; }
    var r = null, i;
    for (i = 0; i < womenData.length; i++) {
      if (womenData[i].archNo === key) { r = womenData[i]; break; }
    }
    if (!r) { toast('未找到档案：' + key, 'warning'); return; }
    var params = [
      'view=' + view,
      'edit=1',
      'name=' + encodeURIComponent(r.name),
      'gender=' + encodeURIComponent(r.gender === '男' ? '男性' : '女性'),
      'idcard=' + encodeURIComponent(r.idcard),
      'idType=' + encodeURIComponent(r.idType || '居民身份证'),
      'archNo=' + encodeURIComponent(r.archNo)
    ];
    if (r.birth) params.push('birth=' + encodeURIComponent(r.birth));
    if (r.phone) params.push('phone=' + encodeURIComponent(r.phone));
    if (r.marriage) params.push('marriage=' + encodeURIComponent(r.marriage));
    if (r.crowd) params.push('crowd=' + encodeURIComponent(r.crowd));
    if (r.region) params.push('region=' + encodeURIComponent(r.region));
    if (r.address) params.push('addr=' + encodeURIComponent(r.address));
    if (r.dutyDoc) params.push('dutyDoc=' + encodeURIComponent(r.dutyDoc));
    if (r.createDate) params.push('createDate=' + encodeURIComponent(r.createDate));
    location.href = '档案维护.html?' + params.join('&');
  }

  document.addEventListener('click', function (e) {
    if (!e.target.closest('.op-more')) closeAllOpMenus();
  });

  /* 筛选控件输入即实时过滤（并回到第一页） */
  ['fName', 'fIdcard', 'fPhone', 'fArchNo'].forEach(function (id) {
    $(id).addEventListener('input', function () { curPage = 1; renderTable(); });
  });
  ['fOrg', 'fRegion', 'fLock', 'fMarriage', 'fCrowd', 'fArchStatus', 'fMine'].forEach(function (id) {
    $(id).addEventListener('change', function () { curPage = 1; renderTable(); });
  });
  ['fBirthStart', 'fBirthEnd', 'fCreateStart', 'fCreateEnd'].forEach(function (id) {
    $(id).addEventListener('input', function () { curPage = 1; renderTable(); });
  });

  /* 复合筛选控件（管理机构/重点人群类型/管辖行政区）选择后实时过滤 */
  document.querySelectorAll('.filter-panel [data-fcp]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      if (e.target.closest('.fcp-opt,.fcp-n,.fcp-clear')) {
        setTimeout(function () { curPage = 1; renderTable(); }, 0);
      }
    });
  });

  /* ================= 档案选择弹框（新建专项第一步） ================= */
  var selectArchiveData = [
    { archNo:'32101211811812487', name:'王海云',     gender:'女', age:76, idType:'居民身份证', idcard:'411602195001222883', crowd:'老年人',       region:'善玉村',   org:'山东大学齐鲁医院', grid:'第二网格', rStatus:'正常', lock:'未上锁', op:'create' },
    { archNo:'32101210010000322', name:'测试',       gender:'男', age:62, idType:'居民身份证', idcard:'35873119631111269X', crowd:'',             region:'东苑社区', org:'山东大学齐鲁医院', grid:'第一网格', rStatus:'正常', lock:'未上锁', op:'create' },
    { archNo:'32101210010000321', name:'测试',       gender:'男', age:59, idType:'居民身份证', idcard:'81994719661217461X', crowd:'',             region:'东苑社区', org:'山东大学齐鲁医院', grid:'第一网格', rStatus:'正常', lock:'未上锁', op:'create' },
    { archNo:'32101210010000320', name:'测试',       gender:'男', age:50, idType:'居民身份证', idcard:'15827819751024691X', crowd:'',             region:'东苑社区', org:'山东大学齐鲁医院', grid:'第二网格', rStatus:'正常', lock:'未上锁', op:'create' },
    { archNo:'32101210010000319', name:'测试',       gender:'男', age:24, idType:'居民身份证', idcard:'51032220011213837X', crowd:'',             region:'东苑社区', org:'山东大学齐鲁医院', grid:'第三网格', rStatus:'正常', lock:'未上锁', op:'create' },
    { archNo:'32101210010000318', name:'自动化测试', gender:'男', age:24, idType:'居民身份证', idcard:'51033320011215847X', crowd:'',             region:'东苑社区', org:'山东大学齐鲁医院', grid:'第一网格', rStatus:'正常', lock:'未上锁', op:'none' },
    { archNo:'32101211811812486', name:'李大海',     gender:'女', age:46, idType:'居民身份证', idcard:'110101198005010149', crowd:'',             region:'善玉村',   org:'山东大学齐鲁医院', grid:'第二网格', rStatus:'正常', lock:'未上锁', op:'create' },
    { archNo:'32101210010000308', name:'李文顺',     gender:'男', age:27, idType:'居民身份证', idcard:'51013219990514121X', crowd:'',             region:'龙川社区', org:'山东大学齐鲁医院', grid:'第三网格', rStatus:'正常', lock:'未上锁', op:'none' },
    { archNo:'51011500100100070', name:'刘柳',       gender:'女', age:36, idType:'居民身份证', idcard:'510123199001010026', crowd:'',             region:'北街社区', org:'山东大学齐鲁医院', grid:'第二网格', rStatus:'正常', lock:'未上锁', op:'create' },
    { archNo:'51011500100100076', name:'小山东高速', gender:'女', age:36, idType:'居民身份证', idcard:'510123199001010106', crowd:'孕,残,低,特,精,结', region:'北街社区', org:'山东大学齐鲁医院', grid:'第二网格', rStatus:'正常', lock:'未上锁', op:'enter' },
    { archNo:'51011500100100074', name:'徐华',       gender:'男', age:50, idType:'居民身份证', idcard:'31011019760306201X', crowd:'',             region:'西街社区', org:'山东大学齐鲁医院', grid:'第三网格', rStatus:'正常', lock:'未上锁', op:'create' },
    { archNo:'51011500100100073', name:'张兰之子',   gender:'女', age:3,  idType:'居民身份证', idcard:'',                   crowd:'儿童',         region:'西街社区', org:'山东大学齐鲁医院', grid:'第一网格', rStatus:'正常', lock:'未上锁', op:'none' }
  ];

  var SF_PAGE_SIZE = 20;
  var sfCurPage = 1;
  var sfLastList = [];

  function renderSelectTable() {
    var name = $('sfName').value.trim(), idType = $('sfIdType').value, idcard = $('sfIdcard').value.trim();
    var org = $('sfOrg').value, grid = $('sfGrid').value.trim();
    var gender = $('sfGender').value, age = $('sfAge').value.trim(), crowd = $('sfCrowd').value, region = $('sfRegion').value.trim();

    sfLastList = selectArchiveData.filter(function (r) {
      if (name && r.name.indexOf(name) === -1) return false;
      if (idType && r.idType !== idType) return false;
      if (idcard && r.idcard.indexOf(idcard) === -1) return false;
      if (gender && r.gender !== gender) return false;
      if (age && String(r.age) !== age) return false;
      if (crowd && r.crowd.indexOf(crowd) === -1) return false;
      if (region && r.region.indexOf(region) === -1) return false;
      return true;
    });

    var total = Math.max(1, Math.ceil(sfLastList.length / SF_PAGE_SIZE));
    if (sfCurPage > total) sfCurPage = total;
    var start = (sfCurPage - 1) * SF_PAGE_SIZE;
    var slice = sfLastList.slice(start, start + SF_PAGE_SIZE);

    var html = '';
    if (slice.length === 0) {
      html = '<tr class="empty-row"><td colspan="13" style="text-align:center;padding:24px;color:var(--text-tertiary)">暂无符合条件的居民档案</td></tr>';
    } else {
      slice.forEach(function (r, i) {
        var opHtml = '';
        if (r.op === 'create') {
          opHtml = '<a class="op-create" onclick="selectArchive(\'' + esc(r.archNo) + '\')">新建</a>';
        } else if (r.op === 'enter') {
          opHtml = '<a class="op-enter" onclick="enterArchive(\'' + esc(r.name) + '\')">进入专项</a>';
        } else {
          opHtml = '<span class="op-none">-</span>';
        }
        var crowdHtml = r.crowd ? '<span class="crowd-tag" title="' + esc(r.crowd) + '">' + esc(r.crowd) + '</span>' : '<span class="op-none">-</span>';
        var rsDot = r.rStatus === '正常' ? 'ok' : 'warn';
        var lkDot = r.lock === '未上锁' ? 'ok' : 'warn';
        html += '<tr>'
          + '<td class="center">' + (start + i + 1) + '</td>'
          + '<td title="' + esc(r.archNo) + '"><span class="cell">' + esc(r.archNo) + '</span></td>'
          + '<td>' + esc(r.name) + '</td>'
          + '<td class="center">' + esc(r.gender) + '</td>'
          + '<td class="center">' + r.age + '</td>'
          + '<td>' + esc(r.idType) + '</td>'
          + '<td title="' + esc(r.idcard) + '"><span class="cell">' + (r.idcard || '-') + '</span></td>'
          + '<td>' + crowdHtml + '</td>'
          + '<td>' + esc(r.region) + '</td>'
          + '<td title="' + esc(r.org) + '"><span class="cell">' + esc(r.org) + '</span></td>'
          + '<td><span class="st-dot ' + rsDot + '"></span>' + esc(r.rStatus) + '</td>'
          + '<td><span class="st-dot ' + lkDot + '"></span>' + esc(r.lock) + '</td>'
          + '<td class="center">' + opHtml + '</td>'
          + '</tr>';
      });
    }
    $('sfTbBody').innerHTML = html;
    $('sfTotal').textContent = sfLastList.length;
    renderSelectPager(total);
    $('sfJump').value = sfCurPage;
  }

  function renderSelectPager(total) {
    var nums = [];
    if (total <= 7) {
      for (var i = 1; i <= total; i++) nums.push(i);
    } else {
      nums.push(1);
      if (sfCurPage > 3) nums.push('…');
      for (var j = Math.max(2, sfCurPage - 1); j <= Math.min(total - 1, sfCurPage + 1); j++) nums.push(j);
      if (sfCurPage < total - 2) nums.push('…');
      nums.push(total);
    }
    var h = '<button class="pg-btn" onclick="sfGotoPage(' + (sfCurPage - 1) + ')">‹</button>';
    nums.forEach(function (n) {
      h += n === '…'
        ? '<span class="pg-ellipsis">…</span>'
        : '<button class="pg-btn' + (n === sfCurPage ? ' active' : '') + '" onclick="sfGotoPage(' + n + ')">' + n + '</button>';
    });
    h += '<button class="pg-btn" onclick="sfGotoPage(' + (sfCurPage + 1) + ')">›</button>';
    $('sfPager').innerHTML = h;
  }

  function sfGotoPage(p) {
    var total = Math.max(1, Math.ceil(sfLastList.length / SF_PAGE_SIZE));
    if (p < 1 || p > total || p === sfCurPage) return;
    sfCurPage = p;
    renderSelectTable();
  }

  function sfJumpPage() {
    var v = parseInt($('sfJump').value, 10);
    if (!isNaN(v)) sfGotoPage(v);
  }

  function resetSelectFilter() {
    ['sfName','sfIdcard','sfGrid','sfAge','sfRegion'].forEach(function (id) { $(id).value = ''; });
    $('sfIdType').value = ''; $('sfOrg').value = '';
    $('sfGender').value = ''; $('sfCrowd').value = '';
    sfCurPage = 1;
    renderSelectTable();
  }

  function applySelectFilter() {
    sfCurPage = 1;
    renderSelectTable();
    toast('查询完成，共 ' + $('sfTotal').textContent + ' 条记录', 'success');
  }

  function toggleSelectExtra() {
    var row = $('sfExtraRow'), btn = $('sfExpand');
    var show = row.style.display !== 'none';
    row.style.display = show ? 'none' : 'flex';
    btn.textContent = show ? '展开 ▼' : '收起 ▲';
  }

  function openSelectModal() {
    sfCurPage = 1;
    renderSelectTable();
    $('selectModal').classList.add('show');
  }

  function closeSelectModal() {
    $('selectModal').classList.remove('show');
  }

  /* 选择档案后点击"新建专项"：跳转至档案维护页，切换到妇女档案表填报界面 */
  function selectArchive(archNo) {
    var r = null;
    for (var i = 0; i < selectArchiveData.length; i++) {
      if (selectArchiveData[i].archNo === archNo) { r = selectArchiveData[i]; break; }
    }
    if (!r) return;
    closeSelectModal();
    var params = [
      'view=womanArchive',
      'edit=1',
      'name=' + encodeURIComponent(r.name),
      'gender=' + encodeURIComponent(r.gender === '男' ? '男性' : '女性'),
      'idcard=' + encodeURIComponent(r.idcard),
      'idType=' + encodeURIComponent(r.idType),
      'archNo=' + encodeURIComponent(r.archNo)
    ];
    if (r.idcard && /^\d{17}[\dXx]$/.test(r.idcard)) {
      params.push('birth=' + r.idcard.slice(6, 10) + '-' + r.idcard.slice(10, 12) + '-' + r.idcard.slice(12, 14));
    }
    location.href = '档案维护.html?' + params.join('&');
  }

  /* 已有专项档案：点击"进入专项" */
  function enterArchive(name) {
    closeSelectModal();
    toast('进入妇女档案：' + name + '（功能建设中）', 'info');
  }

  /* 列表操作列「查看/编辑」：跳转档案维护页并定位到妇女档案表（带行数据预填） */
  function goArchive(archNo) {
    var r = null;
    for (var i = 0; i < womenData.length; i++) {
      if (womenData[i].archNo === archNo) { r = womenData[i]; break; }
    }
    if (!r) return;
    var params = [
      'view=womanArchive',
      'edit=1',
      'name=' + encodeURIComponent(r.name),
      'gender=' + encodeURIComponent(r.gender === '男' ? '男性' : '女性'),
      'idcard=' + encodeURIComponent(r.idcard),
      'idType=' + encodeURIComponent(r.idType || '居民身份证'),
      'archNo=' + encodeURIComponent(r.archNo),
      'addr=' + encodeURIComponent(r.address || '')
    ];
    if (r.birth) params.push('birth=' + encodeURIComponent(r.birth));
    if (r.phone) params.push('phone=' + encodeURIComponent(r.phone));
    if (r.marriage) params.push('marriage=' + encodeURIComponent(r.marriage));
    if (r.crowd) params.push('crowd=' + encodeURIComponent(r.crowd));
    if (r.region) params.push('region=' + encodeURIComponent(r.region));
    if (r.dutyDoc) params.push('dutyDoc=' + encodeURIComponent(r.dutyDoc));
    if (r.createDate) params.push('createDate=' + encodeURIComponent(r.createDate));
    location.href = '档案维护.html?' + params.join('&');
  }

  /* 筛选控件实时过滤 */
  ['sfName','sfIdcard','sfGrid','sfAge','sfRegion'].forEach(function (id) {
    $(id).addEventListener('input', function () { sfCurPage = 1; renderSelectTable(); });
  });
  ['sfIdType','sfOrg','sfGender','sfCrowd'].forEach(function (id) {
    $(id).addEventListener('change', function () { sfCurPage = 1; renderSelectTable(); });
  });

  /* ================= 联系地址：五级级联（省 / 市 / 区县 / 乡镇街道 / 村社区） ================= */
  var ADDR_TREE = {
    '内蒙古自治区': {
      '呼和浩特市': {
        '新城区': { '海拉尔东路街道': ['气东社区','哲里木路社区','八一社区'], '东风路街道': ['光华街社区','丽苑社区'] },
        '赛罕区': { '大学东路街道': ['望兴园社区','桃园社区'], '榆林镇': ['榆林村','三应窑村','什犋窑村'] }
      },
      '包头市': {
        '昆都仑区': { '林荫路街道': ['友谊社区','林荫社区'], '卜尔汉图镇': ['卜尔汉图村','哈业脑包村'] }
      }
    },
    '辽宁省': {
      '沈阳市': {
        '和平区': { '太原街街道': ['中山社区','民族社区'], '浑河站西街道': ['前鲜村','曹仲村'] },
        '铁西区': { '兴华街道': ['兴华园社区','保工社区'], '大潘街道': ['大潘村','小潘村'] }
      },
      '大连市': {
        '中山区': { '桂林街道': ['解放社区','湖畔社区'], '老虎滩街道': ['虎滩社区','中兴社区'] }
      }
    },
    '吉林省': {
      '长春市': {
        '南关区': { '长通街道': ['东广社区','光复路社区'], '幸福乡': ['光明村','杨家村'] },
        '朝阳区': { '红旗街道': ['红旗社区','建政社区'], '乐山镇': ['乐山村','长兴村'] }
      },
      '吉林市': {
        '船营区': { '大东街道': ['松江社区','吉源社区'], '欢喜乡': ['欢喜村','新山村'] }
      }
    },
    '黑龙江省': {
      '哈尔滨市': {
        '道里区': { '兆麟街道': ['兆麟社区','森林社区'], '新农镇': ['新农社区','前进村'] },
        '南岗区': { '花园街道': ['花园社区','繁荣社区'], '王岗镇': ['王岗村','房身村'] }
      },
      '齐齐哈尔市': {
        '龙沙区': { '正阳街道': ['正阳社区','安智社区'], '大民街道': ['大民村','五福玛村'] }
      }
    },
    '上海市': {
      '黄浦区': { '南京东路街道': ['三德里社区','平望社区'], '豫园街道': ['四新社区','果育社区'] },
      '浦东新区': { '陆家嘴街道': ['上港社区','梅园社区'], '川沙新镇': ['连民村','界龙村'] },
      '徐汇区': { '湖南路街道': ['武康社区','复中社区'], '华泾镇': ['华泾社区','星联村'] }
    },
    '江苏省': {
      '南京市': {
        '玄武区': { '梅园新村街道': ['大行宫社区','梅园新村社区','兰园社区'], '锁金村街道': ['锁金一村社区','锁金四村社区','紫鑫城社区'] },
        '秦淮区': { '夫子庙街道': ['夫子庙社区','乌衣巷社区'], '双塘街道': ['来凤街社区','弓道街社区'] },
        '鼓楼区': { '华侨路街道': ['慈悲社社区','广州路社区'], '宁海路街道': ['山西路社区','颐和路社区'] }
      },
      '无锡市': {
        '梁溪区': { '崇安寺街道': ['崇安寺社区','东河花园社区'], '清名桥街道': ['南长街社区','塘南社区'] },
        '滨湖区': { '河埒街道': ['河埒社区','荣巷社区'], '蠡湖街道': ['蠡湖社区','美湖社区'] }
      },
      '徐州市': {
        '云龙区': { '彭城街道': ['彭城社区','晓光社区'], '子房街道': ['子房社区','响山社区'] },
        '鼓楼区': { '黄楼街道': ['黄楼社区','庆北社区'], '牌楼街道': ['牌楼社区','水漫桥社区'] }
      },
      '常州市': {
        '天宁区': { '雕庄街道': ['雕庄社区','朝阳社区'], '青龙街道': ['青龙社区','紫荆社区'] },
        '钟楼区': { '南大街街道': ['南大街社区','双桂坊社区'], '荷花池街道': ['荷花池社区','西新桥社区'] }
      },
      '苏州市': {
        '姑苏区': { '观前街道': ['观前社区','宫巷社区'], '平江街道': ['平江社区','历史街区社区'] },
        '吴中区': { '长桥街道': ['长桥社区','蠡墅社区'], '木渎镇': ['木渎社区','香溪社区','穹窿社区'] }
      },
      '南通市': {
        '崇川区': { '城东街道': ['城东社区','板桥社区'], '和平桥街道': ['和平桥社区','濠阳社区'] },
        '通州区': { '金沙街道': ['金沙社区','新市社区'], '金新街道': ['金新社区','正场社区'] }
      },
      '连云港市': {
        '海州区': { '新浦街道': ['新浦社区','浦西社区'], '新坝镇': ['新坝村','沙杭村'] },
        '连云区': { '墟沟街道': ['墟沟社区','东园社区'], '宿城街道': ['宿城社区','大竹园村'] }
      },
      '淮安市': {
        '清江浦区': { '府前街道': ['府前社区','淮海社区'], '武墩街道': ['武墩村','王元村'] },
        '淮安区': { '淮城街道': ['淮城社区','镇淮楼社区'], '施河镇': ['施河社区','土楼村'] }
      },
      '盐城市': {
        '盐都区': { '潘黄街道': ['潘黄社区','前进社区'], '大冈镇': ['大冈社区','瓦屋村'] },
        '亭湖区': { '五星街道': ['五星社区','新河社区'], '南洋镇': ['南洋社区','东团村'] }
      },
      '扬州市': {
        '广陵区': { '东关街道': ['皮市街社区','琼花观社区','个园社区'], '湾头镇': ['湾头社区','万福村','田庄村'], '沙头镇': ['沙头社区','霍桥社区'] },
        '邗江区': { '邗上街道': ['邗上社区','兰庄社区','贾桥社区'], '槐泗镇': ['槐泗社区','酒甸社区','运河村'], '方巷镇': ['方巷社区','裔家村'] },
        '江都区': {
          '仙女镇': ['龙川社区','引江社区','东苑社区','南苑社区','龙都社区','虹桥社区'],
          '小纪镇': ['小纪社区','宗村社区','纪东村','纪西村','塘头村','高徐村'],
          '武坚镇': ['民乐社区','周西社区','黄思社区','五舍村','花庄村','龙河村'],
          '樊川镇': ['樊川社区','永安社区','三周村','同丰村','东汇村','聚永村'],
          '真武镇': ['真武社区','杨庄社区','邱墅村','曹桥村','蒙套村','滨西村'],
          '宜陵镇': ['宜陵社区','七里社区','双桥村','焦庄村','白塔村','大陈村']
        },
        '宝应县': { '安宜镇': ['安宜社区','白田社区','齐心村','三里村'], '氾水镇': ['氾水社区','葛庄村'] },
        '扬州经济技术开发区': { '文汇街道': ['文汇社区','花园社区','梅苑社区'], '朴席镇': ['朴席社区','土沟村'] },
        '仪征市': { '真州镇': ['真州社区','新城社区','万年村','茶蓬村'], '青山镇': ['青山社区','团结村'] }
      }
    },
    '浙江省': {
      '杭州市': {
        '上城区': { '清波街道': ['清波社区','柳翠井巷社区'], '九堡街道': ['九堡社区','杨公社区'] },
        '西湖区': { '北山街道': ['北山社区','曙光社区'], '转塘街道': ['转塘社区','龙坞村'] }
      },
      '宁波市': {
        '海曙区': { '南门街道': ['南门社区','郎官社区'], '高桥镇': ['高桥社区','望春村'] }
      }
    },
    '山东省': {
      '济南市': {
        '历下区': { '解放路街道': ['解放路社区','十亩园社区'], '姚家街道': ['姚家社区','丁家村'] },
        '市中区': { '舜玉路街道': ['舜玉社区','玉函路社区'], '十六里河街道': ['十六里河社区','大涧沟村'] }
      },
      '青岛市': {
        '市南区': { '八大峡街道': ['八大峡社区','团岛社区'], '珠海路街道': ['珠海路社区','燕儿岛社区'] }
      }
    }
  };

  var addrPath = [];   /* 当前下钻路径（面板展开到第几级） */
  var addrSel = [];    /* 已选定的完整五级路径 */

  /* 取某路径下的子节点名称（第 5 级为字符串数组） */
  function addrNames(path) {
    var node = ADDR_TREE;
    for (var i = 0; i < path.length; i++) { node = node ? node[path[i]] : null; }
    if (Array.isArray(node)) return node;
    return node ? Object.keys(node) : [];
  }

  function addrColHtml(names, level) {
    if (!names.length) return '<div class="addr-col"><div class="addr-empty">暂无数据</div></div>';
    var parents = addrPath.slice(0, level);
    return '<div class="addr-col">' + names.map(function (n) {
      var path = parents.concat([n]);
      var on = (n === addrPath[level]) ||
        (addrSel[level] === n && addrSel.slice(0, level).join('/') === parents.join('/'));
      var hasKid = addrNames(path).length > 0;
      return '<div class="addr-n' + (on ? ' on' : '') + '" data-lv="' + level + '" data-nm="' + esc(n) + '">'
        + '<span class="addr-tx">' + esc(n) + '</span>'
        + (hasKid ? '<span class="addr-arrow">›</span>' : '')
        + '</div>';
    }).join('') + '</div>';
  }

  function renderAddrPanel() {
    var html = addrColHtml(addrNames([]), 0);
    for (var k = 0; k < addrPath.length; k++) {
      var names = addrNames(addrPath.slice(0, k + 1));
      if (!names.length) break;
      html += addrColHtml(names, k + 1);
    }
    $('addrPanel').innerHTML = html;
    positionAddrPanel();
  }

  /* 面板跟随触发框定位：右侧越界左移，下方空间不足则向上弹出 */
  function positionAddrPanel() {
    var panel = $('addrPanel'), box = $('addrCasBox');
    if (!box || !panel.classList.contains('show')) return;
    var r = box.getBoundingClientRect(), pw = panel.offsetWidth, ph = panel.offsetHeight;
    var vw = window.innerWidth, vh = window.innerHeight, left = r.left, top = r.bottom + 4;
    if (left + pw > vw - 8) left = vw - 8 - pw;
    if (left < 8) left = 8;
    if (top + ph > vh - 8) top = Math.max(8, r.top - 4 - ph);
    panel.style.left = Math.round(left) + 'px';
    panel.style.top = Math.round(top) + 'px';
  }

  /* 回填：隐藏域存完整地址（无缝拼接），触发框显示末三级便于识别 */
  function setAddrValue(path) {
    $('cmRegion').value = path.join('');
    var txt = $('cmRegionText');
    txt.textContent = path.length ? path.slice(-3).join(' / ') : '请选择现住址';
    txt.classList.toggle('is-ph', !path.length);
    txt.title = path.length ? path.join(' / ') : '请选择现住址';
    $('addrCas').classList.toggle('has-val', path.length > 0);
    renderPreview();
  }

  function openAddrPanel() {
    addrPath = addrSel.slice();
    $('addrCas').classList.add('open');
    $('addrPanel').classList.add('show');
    renderAddrPanel();
  }
  function closeAddrPanel() {
    $('addrCas').classList.remove('open');
    $('addrPanel').classList.remove('show');
  }
  function toggleAddrPanel() {
    if ($('addrPanel').classList.contains('show')) closeAddrPanel();
    else openAddrPanel();
  }

  /* 点击：有下级则下钻，末级（村社区）则选中并回填 */
  document.addEventListener('click', function (e) {
    if (e.target.closest('#addrCasBox')) { toggleAddrPanel(); return; }
    var node = e.target.closest('#addrPanel .addr-n');
    if (node) {
      var lv = parseInt(node.getAttribute('data-lv'), 10), nm = node.getAttribute('data-nm');
      var path = addrPath.slice(0, lv).concat([nm]);
      if (addrNames(path).length) { addrPath = path; renderAddrPanel(); }
      else { addrSel = path; setAddrValue(path); closeAddrPanel(); }
      return;
    }
    if (!e.target.closest('#addrPanel')) closeAddrPanel();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeAddrPanel(); });
  window.addEventListener('resize', positionAddrPanel);
  window.addEventListener('scroll', function (e) {
    /* 面板内各列自身滚动不关闭，其它滚动一律收起 */
    if (e.target && e.target.classList && e.target.classList.contains('addr-col')) return;
    closeAddrPanel();
  }, true);

  /* ================= 新建妇女档案弹框（版式与「居民档案列表」的新建弹框一致） ================= */
  function pvRow(label, val, wide) {
    return '<div class="pv-row' + (wide ? ' wide' : '') + '"><span class="pv-label">' + label + '</span><span class="pv-val">' + esc(val || '') + '</span></div>';
  }

  /* 回显卡渲染：左侧表单实时联动 */
  function renderPreview() {
    var region = $('cmRegion').value, detail = $('cmAddr').value.trim();
    var addr = region ? region + detail : detail;
    $('pvCard').innerHTML =
      pvRow('姓名：', $('cmName').value.trim()) +
      pvRow('民族：', $('cmNation').value) +
      pvRow('出生年月：', $('cmBirth').value, true) +
      pvRow('证件类型：', $('cmIdType').value) +
      pvRow('证件号：', $('cmIdcard').value.trim()) +
      pvRow('联系地址：', addr, true);
  }

  /* 点击「新建」：直接打开新建妇女档案弹框（证件类型 / 民族带默认值，回显卡同步显示） */
  function openCreateModal() {
    $('cmIdType').value = '居民身份证';
    $('cmIdcard').value = ''; $('cntIdcard').textContent = '0/18';
    $('cmName').value = '';   $('cntName').textContent = '0/8';
    $('cmGender').value = '';
    $('cmNation').value = '汉族';
    $('cmPhone').value = '';
    var birth = $('cmBirth'); birth.type = 'text'; birth.value = '';
    $('cmRegion').value = '';
    addrPath = []; addrSel = []; setAddrValue([]);
    $('cmAddr').value = ''; $('cntAddr').textContent = '0/50';
    renderPreview();
    $('createModal').classList.add('show');
  }

  function closeCreateModal() {
    closeAddrPanel();
    $('createModal').classList.remove('show');
  }

  /* 证件号满 18 位：自动解析出生日期与性别（身份证第 7-14 位出生段、第 17 位奇偶判性别） */
  function parseIdcard() {
    var v = $('cmIdcard').value.trim();
    if (!/^\d{17}[\dXx]$/.test(v)) return;
    $('cmBirth').value = v.slice(6, 10) + '-' + v.slice(10, 12) + '-' + v.slice(12, 14);
    $('cmGender').value = (parseInt(v[16], 10) % 2 === 1) ? '男性' : '女性';
    toast('已根据证件号自动填充出生日期与性别', 'success');
  }

  /* 下一步：校验必填项 → 携带信息进入档案维护界面的「妇女档案」菜单 */
  function submitCreate() {
    var missing = [];
    if (!$('cmIdType').value) missing.push('证件类型');
    var idcard = $('cmIdcard').value.trim();
    if (!idcard) missing.push('证件号');
    else if (!/^\d{17}[\dXx]$/.test(idcard)) { toast('证件号格式不正确，需为 18 位', 'warning'); return; }
    if (!$('cmName').value.trim()) missing.push('姓名');
    if (!$('cmGender').value) missing.push('性别');
    if (!$('cmNation').value) missing.push('民族');
    if (!$('cmPhone').value.trim()) missing.push('联系电话');
    if (!$('cmBirth').value) missing.push('出生日期');
    if (!$('cmRegion').value || !$('cmAddr').value.trim()) missing.push('联系地址');
    if (missing.length) { toast('请完善必填项：' + missing.join('、'), 'warning'); return; }
    closeCreateModal();
    var p = new URLSearchParams();
    p.set('view', 'womanArchive');
    p.set('edit', '1');
    p.set('name', $('cmName').value.trim());
    p.set('gender', $('cmGender').value);
    p.set('idType', $('cmIdType').value);
    p.set('idcard', $('cmIdcard').value.trim());
    p.set('birth', $('cmBirth').value);
    p.set('phone', $('cmPhone').value.trim());
    p.set('nation', $('cmNation').value);
    p.set('region', $('cmRegion').value);
    p.set('addr', $('cmAddr').value.trim());
    location.href = '档案维护.html?' + p.toString();
  }

  /* 弹框联动事件（联系地址由级联控件回填时主动触发 renderPreview） */
  ['cmIdType', 'cmGender', 'cmNation', 'cmBirth'].forEach(function (id) {
    $(id).addEventListener('change', renderPreview);
  });
  $('cmPhone').addEventListener('input', renderPreview);
  $('cmIdcard').addEventListener('input', function () {
    $('cntIdcard').textContent = this.value.length + '/18';
    if (this.value.length === 18) parseIdcard();
    renderPreview();
  });
  $('cmName').addEventListener('input', function () {
    $('cntName').textContent = this.value.length + '/8';
    renderPreview();
  });
  $('cmAddr').addEventListener('input', function () {
    $('cntAddr').textContent = this.value.length + '/50';
    renderPreview();
  });

  /* 初始渲染 */
  renderTable();
