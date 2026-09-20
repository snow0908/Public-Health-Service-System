# -*- coding: utf-8 -*-

PATH = 'D:/AI_Project/Public-Health-Service-System/Public-Health-Service-System/01-公共卫生服务系统产品文档/V1.0/02.需求设计/原型设计/妇女管理.html'

with open(PATH, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find renderTable boundaries
start_idx = None
for i, line in enumerate(lines):
    if 'function renderTable()' in line:
        start_idx = i
        break

if start_idx is None:
    print('ERROR: renderTable not found')
    exit(1)

# Find end by brace counting
brace_count = 0
found_open = False
end_idx = None
for i in range(start_idx, len(lines)):
    for ch in lines[i]:
        if ch == '{':
            brace_count += 1
            found_open = True
        elif ch == '}':
            brace_count -= 1
    if found_open and brace_count == 0:
        end_idx = i
        break

print(f'renderTable: lines {start_idx+1} - {end_idx+1}')

new_render = '''  function renderTable() {
    var org = $('fOrg').value, name = $('fName').value.trim(), idcard = $('fIdcard').value.trim();
    var region = $('fRegion').value, lock = $('fLock').value;
    var marriage = $('fMarriage').value, crowd = $('fCrowd').value;
    var phone = $('fPhone').value.trim(), archNo = $('fArchNo').value.trim();
    var address = $('fAddress').value.trim(), dutyDoc = $('fDutyDoc').value.trim();
    var archStatus = $('fArchStatus').value;
    var birthStart = $('fBirthStart').value, birthEnd = $('fBirthEnd').value;
    var createStart = $('fCreateStart').value, createEnd = $('fCreateEnd').value;

    lastList = womenData.filter(function (r) {
      if (org && r.org !== org) return false;
      if (name && r.name.indexOf(name) === -1) return false;
      if (idcard && r.idcard.indexOf(idcard) === -1) return false;
      if (region && r.region !== region) return false;
      if (lock && r.lock !== lock) return false;
      if (marriage && r.marriage !== marriage) return false;
      if (crowd && (!r.crowd || r.crowd.indexOf(crowd) === -1)) return false;
      if (phone && r.phone.indexOf(phone) === -1) return false;
      if (archNo && r.archNo.indexOf(archNo) === -1) return false;
      if (address && r.address.indexOf(address) === -1) return false;
      if (dutyDoc && r.dutyDoc.indexOf(dutyDoc) === -1) return false;
      if (archStatus && r.archStatus !== archStatus) return false;
      if (birthStart && r.birth < birthStart) return false;
      if (birthEnd && r.birth > birthEnd) return false;
      if (createStart && r.createDate < createStart) return false;
      if (createEnd && r.createDate > createEnd) return false;
      return true;
    });

    var total = Math.max(1, Math.ceil(lastList.length / PAGE_SIZE));
    if (curPage > total) curPage = total;
    var start = (curPage - 1) * PAGE_SIZE;
    var slice = lastList.slice(start, start + PAGE_SIZE);

    var crowdMap = { '孕':'yun', '残':'can', '低':'di', '特':'te', '精':'jing', '结':'jie', '老':'lao' };
    var crowdLabel = { '孕':'孕', '残':'残', '低':'低', '特':'特', '精':'精', '结':'结', '老':'老' };
    var html = '';
    if (slice.length === 0) {
      html = '<tr class="empty-row"><td colspan="18"><div class="ico">📭</div>暂无符合条件的妇女管理档案</td></tr>';
    } else {
      slice.forEach(function (r, i) {
        var lkDot = r.lock === '未上锁' ? 'ok' : 'warn';
        var crowdHtml = '';
        if (r.crowd) {
          r.crowd.split(',').forEach(function(c) {
            if (crowdMap[c]) {
              crowdHtml += '<span class="crowd-tag ' + crowdMap[c] + '">' + crowdLabel[c] + '</span>';
            }
          });
        }
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
          +     '<a class="more-btn" onclick="toggleOpMenu(this,event)">新建服务<svg viewBox="0 0 24 24" style="width:10px;height:10px;fill:none;stroke:currentColor;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round"><polyline points="6 9 12 15 18 9"/></svg></a>'
          +     '<span class="op-menu">'
          +       '<button class="mi" onclick="opAction(\'产前随访\',\'' + esc(r.name) + '\')">产前随访</button>'
          +       '<button class="mi" onclick="opAction(\'产后访视\',\'' + esc(r.name) + '\')">产后访视</button>'
          +       '<button class="mi" onclick="opAction(\'产后42天检查\',\'' + esc(r.name) + '\')">产后42天检查</button>'
          +       '<button class="mi" onclick="opAction(\'妇女病普查\',\'' + esc(r.name) + '\')">妇女病普查</button>'
          +     '</span>'
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
'''

# Replace lines
new_lines = lines[:start_idx] + [new_render] + lines[end_idx+1:]

with open(PATH, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print('Fixed renderTable successfully')
