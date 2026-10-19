# Recalculates a GRND business case export with the `formulas` package and
# prints formula errors, the Summary sheet and Unit Economics.
# Usage: python3 scripts/check_business_case.py <file.xlsx>
import sys, formulas, openpyxl, re, warnings, io, contextlib
warnings.filterwarnings("ignore")
path = sys.argv[1]
with contextlib.redirect_stderr(io.StringIO()):
    xl = formulas.ExcelModel().loads(path).finish()
    sol = xl.calculate()
vals = {}
for k, v in sol.items():
    m = re.match(r"'\[(.+)\](.+)'!([A-Z]+)(\d+)$", k)
    if not m: continue
    try: val = v.value[0][0]
    except Exception: val = v
    vals[(m.group(2).upper(), m.group(3), int(m.group(4)))] = val
errs = {}
for (sh, c, r), v in vals.items():
    sv = str(v)
    if sv.startswith('#') or 'XlError' in type(v).__name__:
        errs.setdefault(sh, []).append(f"{c}{r}={sv}")
print("ERRORS:", {k: (len(v), v[:4]) for k, v in errs.items()} or "none")
wb = openpyxl.load_workbook(path)
print("sheets:", [ (ws.title + ('(hidden)' if ws.sheet_state=='hidden' else '')) for ws in wb.worksheets])
def show(sheet, cols, maxrow=60):
    ws = wb[sheet]
    for r in range(1, maxrow):
        a = ws.cell(r, 1).value
        if a is None: continue
        row = []
        for c in cols:
            v = vals.get((sheet.upper(), c, r), ws[f"{c}{r}"].value)
            if isinstance(v, float): v = round(v, 1)
            row.append(v)
        if any(x not in (None, '') for x in row):
            print(f"  {str(a)[:50]:50} {row}")
print("SUMMARY (pess/base/opt)"); show('Summary', ['B','C','D'])
print("UNIT ECONOMICS (pess/base/opt/active/status)"); show('Unit Economics', ['B','C','D','E','G'], 20)
