# -*- coding: utf-8 -*-
import re

PATH = 'D:/AI_Project/Public-Health-Service-System/Public-Health-Service-System/01-公共卫生服务系统产品文档/V1.0/02.需求设计/原型设计/妇女管理.html'

with open(PATH, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix resetFilter
old_reset = '''function resetFilter() {
    ['fName', 'fIdcard', 'fArchNo', 'fPhone', 'fAddress', 'fSpecDoc', 'fArchDoc', 'fFuCnt', 'fExamCnt', 'fFullVal'].forEach(function (id) { $(id).value = ''; });
    ['fOrg', 'fRegion', 'fGrid', 'fGrade', 'fHpType', 'fFuCntOp', 'fExamCntOp', 'fFullOp', 'fFuType', 'fBpItem', 'fSpecOrg', 'fResidentType', 'fGender', 'fLiveType'].forEach(function (id) { $(id).value = ''; });
    ['fBizStart', 'fBizEnd', 'fSpecStart', 'fSpecEnd', 'fArchStart', 'fArchEnd', 'fBirthStart', 'fBirthEnd'].forEach(function (id) { var el = $(id); el.value = ''; el.type = 'text'; });
    $('fLock').value = '未上锁';
    $('fRStatus').value = '正常';
    $('fMStatus').value = '有效管理';
    document.querySelectorAll('input[name=fYearEval],input[name=fDrug]').forEach(function (r) { r.checked = false; });
    $('fMine').checked = false;
    $('fBpItem').value = '';
    bpApplied = [];
    resetBpPanel();
    curPage = 1;
    renderTable();
    toast('筛选条件已重置', 'success');
  }'''

new_reset = '''function resetFilter() {
    ['fName', 'fIdcard', 'fArchNo', 'fPhone', 'fAddress', 'fDutyDoc'].forEach(function (id) { $(id).value = ''; });
    ['fOrg', 'fRegion', 'fMarriage', 'fCrowd', 'fArchStatus'].forEach(function (id) { $(id).value = ''; });
    ['fBirthStart', 'fBirthEnd', 'fCreateStart', 'fCreateEnd'].forEach(function (id) { var el = $(id); el.value = ''; el.type = 'text'; });
    $('fLock').value = '';
    curPage = 1;
    renderTable();
    toast('筛选条件已重置', 'success');
  }'''

content = content.replace(old_reset, new_reset)

# 2. Fix tabbar label
content = content.replace('      高血压管理', '      妇女管理')

# 3. Fix select options in select modal (crowd type)
content = content.replace('<option value="高血压">高血压</option>', '<option value="孕产妇">孕产妇</option>')

# 4. Fix hpType options in create/edit modal
content = content.replace('<option value="原发性高血压">原发性高血压</option>', '<option value="未婚">未婚</option>')
content = content.replace('<option value="继发性高血压">继发性高血压</option>', '<option value="已婚">已婚</option>')

# 5. Fix data crowd value
content = content.replace("crowd:'高血压 糖尿病', region:'北街社区', org:'山东大", "crowd:'孕,残,低,特,精,结', region:'北街社区', org:'山东大")

with open(PATH, 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixes applied successfully')
