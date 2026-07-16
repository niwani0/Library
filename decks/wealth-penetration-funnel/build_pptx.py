#!/usr/bin/env python3
"""Build the Wealth Penetration Funnel deck as a native .pptx.

Mirrors index.html (17 core slides) and adds an appendix: taxonomy mapping key,
full per-market FRP tables (2024-2030), the rendered trajectory chart, and
sources/caveats. Data source of truth: data.md.
"""
import os
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.chart import XL_CHART_TYPE, XL_LEGEND_POSITION, XL_TICK_MARK
from pptx.chart.data import CategoryChartData
from pptx.oxml.ns import qn

HERE = os.path.dirname(os.path.abspath(__file__))
CHART_IMG = os.path.join(HERE, "chart-trajectory.png")

# ---- palette ----
def C(h): return RGBColor(int(h[0:2],16),int(h[2:4],16),int(h[4:6],16))
NAVY=C("0b1e34"); INK=C("10202e"); GOLD=C("c9962f"); GOLDSOFT=C("f3e4c0"); GOLDINK=C("6b4d13")
MUTED=C("5c6b7a"); LINE=C("dde3ea"); MIST=C("f4f6f9"); WHITE=C("ffffff"); GREY=C("6d8298")
NTB=C("1f6feb"); NTBS=C("e3eefb"); ETB=C("0f9488"); ETBS=C("d6efec"); CLEAN=C("b4562b"); CLEANS=C("f6e4da")
GOOD=C("1f8a4c"); WARN=C("b8860b"); BAD=C("c0392b"); PURP=C("7b3f8f"); SME=C("d97706")
GRP=C("eef2f6"); TOTBG=C("eaf1f8")
LEFT,CENTER,RIGHT=PP_ALIGN.LEFT,PP_ALIGN.CENTER,PP_ALIGN.RIGHT
FONT="Segoe UI"

prs=Presentation()
prs.slide_width=Inches(13.333); prs.slide_height=Inches(7.5)
BLANK=prs.slide_layouts[6]

def slide(dark=False):
    s=prs.slides.add_slide(BLANK)
    s.background.fill.solid(); s.background.fill.fore_color.rgb = NAVY if dark else WHITE
    return s

def tbox(s,l,t,w,h):
    tb=s.shapes.add_textbox(Inches(l),Inches(t),Inches(w),Inches(h))
    tf=tb.text_frame; tf.word_wrap=True
    tf.margin_left=0;tf.margin_right=0;tf.margin_top=0;tf.margin_bottom=0
    return tf

def line(tf,text,size=14,color=INK,bold=False,italic=False,align=LEFT,first=False,
         sa=3,sb=0,ls=1.06,name=FONT):
    p=tf.paragraphs[0] if first else tf.add_paragraph()
    p.alignment=align; p.space_after=Pt(sa); p.space_before=Pt(sb)
    if ls: p.line_spacing=ls
    r=p.add_run(); r.text=text
    f=r.font; f.size=Pt(size); f.bold=bold; f.italic=italic; f.name=name; f.color.rgb=color
    return p

def runs(tf,segs,align=LEFT,first=False,sa=3,sb=0,ls=1.06):
    """segs: list of (text,size,color,bold)"""
    p=tf.paragraphs[0] if first else tf.add_paragraph()
    p.alignment=align; p.space_after=Pt(sa); p.space_before=Pt(sb); p.line_spacing=ls
    for seg in segs:
        text,size,color,bold=seg
        r=p.add_run(); r.text=text
        f=r.font; f.size=Pt(size); f.color.rgb=color; f.bold=bold; f.name=FONT
    return p

def shp(s,kind,l,t,w,h,fill=None,ln=None,lw=0.75,radius=None):
    o=s.shapes.add_shape(kind,Inches(l),Inches(t),Inches(w),Inches(h))
    if radius is not None:
        try: o.adjustments[0]=radius
        except Exception: pass
    if fill is None: o.fill.background()
    else: o.fill.solid(); o.fill.fore_color.rgb=fill
    if ln is None: o.line.fill.background()
    else: o.line.color.rgb=ln; o.line.width=Pt(lw)
    o.shadow.inherit=False
    return o

def header(s,num,kicker,title,dark=False):
    b=shp(s,MSO_SHAPE.ROUNDED_RECTANGLE,0.75,0.5,0.6,0.34,fill=(GOLD if dark else NAVY),radius=0.22)
    b.text_frame.vertical_anchor=MSO_ANCHOR.MIDDLE
    line(b.text_frame,num,size=13,color=(NAVY if dark else WHITE),bold=True,align=CENTER,first=True,sa=0)
    line(tbox(s,1.5,0.5,11.2,0.28),kicker.upper(),size=11,color=GOLD,bold=True,first=True,sa=0)
    line(tbox(s,1.5,0.78,11.2,1.0),title,size=25,color=(WHITE if dark else NAVY),bold=True,first=True,ls=1.02)
    return 1.82

def foot(s,page,dark=False):
    col=GREY if dark else MUTED
    line(tbox(s,0.75,7.04,7,0.3),"PREMIER WEALTH · PATH TO 50%",size=8,color=col,first=True,sa=0)
    line(tbox(s,11.9,7.04,0.65,0.3),str(page),size=8,color=col,align=RIGHT,first=True,sa=0)

def card(s,l,t,w,h,accent=None,fill=WHITE,ln=LINE):
    c=shp(s,MSO_SHAPE.ROUNDED_RECTANGLE,l,t,w,h,fill=fill,ln=ln,lw=0.75,radius=0.05)
    if accent:
        shp(s,MSO_SHAPE.ROUNDED_RECTANGLE,l+0.04,t-0.02,w-0.08,0.09,fill=accent,radius=0.5)
    return c

def pill(s,l,t,w,text,fill,txt):
    p=shp(s,MSO_SHAPE.ROUNDED_RECTANGLE,l,t,w,0.24,fill=fill,radius=0.5)
    p.text_frame.vertical_anchor=MSO_ANCHOR.MIDDLE
    p.text_frame.word_wrap=False
    line(p.text_frame,text,size=8.5,color=txt,bold=True,align=CENTER,first=True,sa=0)
    return p

def metric(s,l,t,w,h,value,label,vcolor=NAVY):
    card(s,l,t,w,h)
    tf=tbox(s,l+0.18,t+0.16,w-0.34,h-0.28)
    line(tf,value,size=26,color=vcolor,bold=True,first=True,sa=2,ls=1.0)
    line(tf,label,size=10,color=MUTED,sa=0,ls=1.08)

def headline(s,l,t,w,text,fill=GOLDSOFT,bar=GOLD,txt=GOLDINK):
    shp(s,MSO_SHAPE.ROUNDED_RECTANGLE,l,t,w,0.72,fill=fill,radius=0.06)
    shp(s,MSO_SHAPE.RECTANGLE,l,t,0.06,0.72,fill=bar)
    tf=tbox(s,l+0.22,t+0.13,w-0.4,0.5); tf.vertical_anchor=MSO_ANCHOR.MIDDLE
    line(tf,text,size=13.5,color=txt,bold=True,first=True,sa=0,ls=1.12)

def clear_table_style(tbl):
    tblPr=tbl._tbl.tblPr
    for ch in list(tblPr):
        if ch.tag==qn('a:tableStyleId'): tblPr.remove(ch)
    el=tblPr.makeelement(qn('a:tableStyleId'),{}); el.text='{2D5ABB26-0587-4C30-8999-92F81FD0307C}'
    tblPr.append(el)

def cell(c,text,size,color,bold=False,fill=WHITE,align=LEFT):
    c.fill.solid(); c.fill.fore_color.rgb=fill
    c.margin_left=Inches(0.06); c.margin_right=Inches(0.06)
    c.margin_top=Inches(0.02); c.margin_bottom=Inches(0.02)
    c.vertical_anchor=MSO_ANCHOR.MIDDLE
    tf=c.text_frame; tf.word_wrap=True
    p=tf.paragraphs[0]; p.alignment=align
    r=p.add_run(); r.text=text
    f=r.font; f.size=Pt(size); f.bold=bold; f.name=FONT; f.color.rgb=color

def table(s,l,t,w,headers,rows,ratios,aligns,group_rows=(),total_rows=(),
          rowh=0.285,hh=0.3,body=9,hsize=8):
    nr=len(rows)+1; nc=len(headers)
    g=s.shapes.add_table(nr,nc,Inches(l),Inches(t),Inches(w),Inches(rowh*(nr-1)+hh)).table
    clear_table_style(g)
    tot=sum(ratios)
    for j,r in enumerate(ratios): g.columns[j].width=Inches(w*r/tot)
    g.rows[0].height=Inches(hh)
    for j,htext in enumerate(headers):
        cell(g.cell(0,j),htext,hsize,MUTED,bold=True,fill=MIST,align=aligns[j])
    for i,row in enumerate(rows,start=1):
        g.rows[i].height=Inches(rowh)
        is_grp=(i-1) in group_rows; is_tot=(i-1) in total_rows
        for j,val in enumerate(row):
            if is_grp:
                cell(g.cell(i,j),val,hsize,NAVY,bold=True,fill=GRP,align=aligns[j])
            elif is_tot:
                cell(g.cell(i,j),val,body,NAVY,bold=True,fill=TOTBG,align=aligns[j])
            else:
                col=NAVY if j==0 else INK
                cell(g.cell(i,j),val,body,col,bold=(j==0),fill=WHITE,align=aligns[j])
    return g

# ======================================================================
# DATA
YEARS=["2024","2025","2026","2027","2028","2029","2030"]
MKT_ROWS=[  # (label, key, kind)  kind: grp/data/total
 ("Priority Growth Markets",None,"grp"),
 ("Singapore (SGH)","SGH","d"),("UAE","UAE","d"),("India (INM)","INM","d"),("AOC","AOC","d"),
 ("Wealth & International Connectivity",None,"grp"),
 ("Malaysia (MYH)","MYH","d"),("Taiwan (TWN)","TWN","d"),("Channel Is. (CIIOM)","CIIOM","d"),("US","US","d"),("Mexico (MX)","MX","d"),
 ("IWPB-9 Markets","IWPB9","t"),
 ("IWPB-9 Asia","ASIA","d"),("IWPB-9 Americas & EU","AMEU","d"),("IWPB-9 Middle East","ME","d"),
]
PEN={"SGH":[21.5,23.9,25.9,28.5,33.3,38.4,43.7],"UAE":[15.8,17.2,19.8,22.4,26.3,29.9,30.8],
 "INM":[29.1,30.1,32.6,34.7,38.0,42.0,45.0],"AOC":[40.6,45.6,48.3,48.5,48.7,48.9,49.4],
 "MYH":[36.6,36.0,37.0,37.8,38.5,39.3,40.3],"TWN":[42.0,42.8,47.7,45.8,46.8,47.8,48.8],
 "CIIOM":[0.0,8.5,18.2,14.0,16.0,18.0,20.0],"US":[17.4,17.1,17.7,19.1,20.5,21.7,22.7],
 "MX":[45.7,48.4,50.0,53.2,55.7,58.2,60.8],"IWPB9":[32.2,33.0,36.2,36.6,38.6,40.8,42.8],
 "ASIA":[34.9,37.5,39.9,40.6,42.3,44.2,46.2],"AMEU":[30.8,29.9,33.8,33.9,36.0,38.2,40.4],
 "ME":[15.8,17.2,19.8,22.4,26.3,29.9,30.8]}
QUAL={"SGH":[33.9,36.6,38.7,41.6,43.6,45.6,47.7],"UAE":[22.8,27.9,28.3,34.8,40.1,45.8,51.3],
 "INM":[31.3,30.1,30.3,30.4,30.7,31.1,33.2],"AOC":[54.1,61.7,69.2,78.2,83.3,86.3,88.3],
 "MYH":[59.0,59.0,60.1,61.2,62.5,63.9,65.5],"TWN":[53.1,51.7,58.9,55.7,57.7,59.7,61.7],
 "CIIOM":[47.1,38.3,51.0,41.7,43.8,46.0,48.0],"US":[40.7,41.0,40.7,50.0,54.0,57.0,60.0],
 "MX":[31.9,32.3,36.1,38.8,41.1,43.4,45.0],"IWPB9":[42.6,43.4,47.1,50.7,53.5,55.9,58.1],
 "ASIA":[47.9,51.0,55.1,58.7,61.3,63.0,64.8],"AMEU":[38.5,36.6,39.5,43.4,46.1,48.5,50.4],
 "ME":[22.8,27.9,28.3,34.8,40.1,45.8,51.3]}
CUST={"SGH":[160800,159482,177571,199018,224359,259175,296335],"UAE":[95909,100030,113438,127061,146967,171929,204098],
 "INM":[126808,142870,157351,175965,200395,229647,260590],"AOC":[360841,372747,400311,423747,466184,522015,583044],
 "MYH":[151954,154510,162206,172176,184034,197574,213045],"TWN":[84160,84719,94527,104689,120149,139614,163239],
 "CIIOM":[124298,132370,85852,159646,179405,202468,228555],"US":[299424,301798,307155,324033,339877,354420,366816],
 "MX":[269172,361930,388647,410220,452103,498066,546179],"IWPB9":[1673366,1810456,1887056,2096554,2313473,2574908,2861901],
 "ASIA":[884563,914328,991965,1075595,1195120,1348025,1516253],"AMEU":[692894,796098,781653,893899,971385,1054954,1141551],
 "ME":[95909,100030,113438,127061,146967,171929,204098]}
MOB3={"SGH":[4.5,6.1,10.0],"UAE":[4.6,7.0,11.4],"INM":[10.9,9.8,12.2],"AOC":[41.0,44.7,44.7],
 "MYH":[19.1,18.3,19.5],"TWN":[17.8,18.1,18.3],"CIIOM":[2.1,3.0,3.2],"US":[7.7,8.0,9.5],"MX":[16.8,19.7,20.7],
 "IWPB9":[20.3,21.4,22.0],"ASIA":[26.5,28.3,28.8],"AMEU":[8.6,9.7,11.2],"ME":[4.6,7.0,11.4]}

def pct(v): return f"{v:.1f}%"
def th(v): return f"{v:,.0f}"

# ======================================================================
# CORE SLIDES
def s0_title():
    s=slide(dark=True)
    shp(s,MSO_SHAPE.ROUNDED_RECTANGLE,0.75,1.15,0.55,0.55,fill=GOLD,radius=0.2)
    b=s.shapes[-1]; b.text_frame.vertical_anchor=MSO_ANCHOR.MIDDLE
    line(b.text_frame,"W",size=22,color=NAVY,bold=True,align=CENTER,first=True,sa=0)
    line(tbox(s,1.5,1.28,10,0.3),"PREMIER WEALTH · STRATEGY · FRP 2026",size=11,color=C("cdd8e4"),bold=True,first=True,sa=0)
    line(tbox(s,0.75,2.05,11.5,1.6),"The Path to 50% Wealth Penetration",size=48,color=WHITE,bold=True,first=True,ls=1.0)
    line(tbox(s,0.75,3.55,10.2,0.9),
         "The current FRP lands penetration at 42.8% by 2030 — 7.2pp short of the ambition. A portfolio-system diagnosis of why, and the interventions that close the gap.",
         size=15,color=C("cdd8e4"),first=True,ls=1.25)
    runs(tbox(s,0.75,4.75,11.5,1.7),
      [("We are not on track for 50% — the plan itself only reaches ",13.5,C("b9c6d4"),False),
       ("42.8%",13.5,GOLD,True),
       (" by 2030. The issue is not one campaign; it is a portfolio system problem across ",13.5,C("b9c6d4"),False),
       ("acquisition quality, on-book conversion, and structural dilution.",13.5,GOLD,True),
       (" We run a funnel-diagnostic loop — define the outcome, diagnose the funnel, isolate the true bottleneck, intervene, close the measurement loop — borrowing the operating instinct behind dialer.io: relentlessly diagnose where the funnel leaks, and fix the true bottleneck first.",13.5,C("b9c6d4"),False)],
      first=True,ls=1.3)
    foot(s,"",dark=True)

def s1_define_gap():
    s=slide(); header(s,"01","Define the outcome · case for change","The plan does not reach the ambition")
    metric(s,0.75,1.8,3.83,0.95,"50%","Wealth penetration ambition")
    metric(s,4.75,1.8,3.83,0.95,"42.8%","IWPB-9 at 2030 on current FRP",vcolor=BAD)
    metric(s,8.77,1.8,3.83,0.95,"−7.2pt","Gap the plan does not close",vcolor=CLEAN)
    # trajectory chart as the evidence panel (left)
    cd=CategoryChartData(); cd.categories=YEARS
    cd.add_series("IWPB-9",tuple(PEN["IWPB9"]))
    cd.add_series("Asia",tuple(PEN["ASIA"]))
    cd.add_series("Americas & EU",tuple(PEN["AMEU"]))
    cd.add_series("Middle East",tuple(PEN["ME"]))
    cd.add_series("50% ambition",tuple([50]*7))
    gf=s.shapes.add_chart(XL_CHART_TYPE.LINE,Inches(0.35),Inches(2.9),Inches(7.6),Inches(3.75),cd)
    ch=gf.chart; ch.has_title=False
    ch.has_legend=True; ch.legend.position=XL_LEGEND_POSITION.BOTTOM; ch.legend.include_in_layout=False
    ch.legend.font.size=Pt(9.5); ch.legend.font.name=FONT
    cols=[NAVY,NTB,ETB,SME,GOLD]; widths=[3.0,2.0,2.0,2.0,1.5]
    for ser,col,wd in zip(ch.series,cols,widths):
        ser.smooth=False; lf=ser.format.line; lf.color.rgb=col; lf.width=Pt(wd)
    try:
        from pptx.enum.line import MSO_LINE_DASH_STYLE
        ch.series[4].format.line.dash_style=MSO_LINE_DASH_STYLE.DASH
    except Exception: pass
    va=ch.value_axis; va.minimum_scale=10; va.maximum_scale=55; va.major_unit=10
    va.has_major_gridlines=True; va.major_gridlines.format.line.color.rgb=C("eef2f6")
    va.tick_labels.number_format='0"%"'; va.tick_labels.number_format_is_linked=False
    va.tick_labels.font.size=Pt(9); va.tick_labels.font.color.rgb=MUTED
    va.format.line.color.rgb=LINE
    ca=ch.category_axis; ca.tick_labels.font.size=Pt(9.5); ca.tick_labels.font.color.rgb=MUTED
    ca.format.line.color.rgb=C("c7d0da"); ca.major_tick_mark=XL_TICK_MARK.NONE
    # right: two outcomes + headline
    card(s,8.1,2.9,4.5,1.42,accent=ETB)
    tf=tbox(s,8.3,3.08,4.1,1.2)
    line(tf,"OUTCOME 1",size=9,color=ETB,bold=True,first=True,sa=3)
    runs(tf,[("Grow absolute wealth customers and NNIA.",10.5,NAVY,True),(" Active customers plan +9.6% CAGR to 2.86m by 2030 — qualified, wealth-active growth must outpace raw acquisition.",10.5,INK,False)],ls=1.13)
    card(s,8.1,4.42,4.5,1.42,accent=CLEAN)
    tf=tbox(s,8.3,4.6,4.1,1.2)
    line(tf,"OUTCOME 2",size=9,color=CLEAN,bold=True,first=True,sa=3)
    runs(tf,[("Improve penetration without relying solely on denominator reduction.",10.5,NAVY,True),(" Clean-up supports health but cannot be the primary route to 50%.",10.5,INK,False)],ls=1.13)
    headline(s,8.1,5.94,4.5,"We cannot convert our way out of continuously acquiring low-quality customers.")
    line(tbox(s,0.5,6.7,7.4,0.3),"Portfolio MOB4+, 2024A → 2030 FRP. No region reaches 50% — MX (60.8%) only market above; US (22.7%) furthest below.",
         size=8.5,color=MUTED,italic=True,first=True,sa=0)
    foot(s,1)

def s3_funnel():
    s=slide(); header(s,"02","Define the wealth growth funnel","One common funnel — where value is created or lost")
    stages=[("1","Acquired / upgraded","entry into Premier",C("1f6feb")),
            ("2","Funded","money in",C("2a6fb0")),
            ("3","TRB qualified","47% on-book · 39% @MOB3",C("0f9488")),
            ("4","Wealth activated","36% on-book · 22% @MOB3",C("1f8a4c")),
            ("5","NNIA generating","net-new invested assets",C("c9962f")),
            ("6","Sustained / retained","still qualified at MOB12+",C("8a5a1e"))]
    y=2.0
    for n,lab,sub,col in stages:
        shp(s,MSO_SHAPE.ROUNDED_RECTANGLE,0.75,y,6.5,0.62,fill=col,radius=0.12)
        c=shp(s,MSO_SHAPE.OVAL,0.95,y+0.14,0.34,0.34,fill=WHITE); c.fill.fore_color.rgb=C("ffffff")
        c.text_frame.vertical_anchor=MSO_ANCHOR.MIDDLE
        line(c.text_frame,n,size=12,color=col,bold=True,align=CENTER,first=True,sa=0)
        tf=tbox(s,1.45,y+0.09,3.6,0.44); tf.vertical_anchor=MSO_ANCHOR.MIDDLE
        line(tf,lab,size=13.5,color=WHITE,bold=True,first=True,sa=0)
        tf=tbox(s,4.7,y+0.09,2.4,0.44); tf.vertical_anchor=MSO_ANCHOR.MIDDLE
        line(tf,sub,size=9.5,color=WHITE,align=RIGHT,first=True,sa=0)
        y+=0.7
    line(tbox(s,0.75,y+0.02,6.5,0.4),
         "The MOB3 vs on-book gap at stages 3–4 is the tell: new inflow qualifies and activates at roughly half the on-book rate.",
         size=9.5,color=MUTED,italic=True,first=True,sa=0)
    line(tbox(s,7.55,1.95,5.0,0.3),"Three customer pools, one architecture",size=13,color=NAVY,bold=True,first=True,sa=0)
    pools=[("NTB","New acquisition","Are we bringing in customers capable of driving wealth growth?",NTB,NTBS),
           ("ETB","Existing customers","Where is investable money sitting on-book, and why isn't it converting?",ETB,ETBS),
           ("Clean-up","Value protection","What is structurally dragging penetration and productivity down?",CLEAN,CLEANS)]
    yy=2.35
    for tag,ttl,desc,col,soft in pools:
        card(s,7.55,yy,5.0,1.02,accent=col)
        pill(s,7.75,yy+0.16,0.95,tag.upper(),soft,col)
        line(tbox(s,8.85,yy+0.17,3.5,0.3),ttl,size=12,color=NAVY,bold=True,first=True,sa=0)
        line(tbox(s,7.75,yy+0.52,4.6,0.42),desc,size=10.5,color=MUTED,first=True,sa=0,ls=1.1)
        yy+=1.12
    runs(tbox(s,0.75,6.62,11.85,0.4),
         [("Method: ",9.5,NAVY,True),
          ("a funnel-diagnostic loop — define the outcome → diagnose → isolate the true bottleneck → intervene → close the measurement loop. The framing borrows the operating instinct behind dialer.io (relentlessly diagnose where the funnel leaks and fix the true bottleneck); the loop itself is standard funnel-diagnostic practice.",9.5,MUTED,False)],
         first=True,ls=1.1)
    foot(s,2)

def s4_scorecard():
    s=slide(); header(s,"03","Current position by market · IWPB-9, portfolio MOB4+","Which markets are on track — and where the funnel breaks")
    heads=["Market","Pen. 2024","Pen. 2026","Pen. 2030","Gap to 50%","TRB-qual 2026","Pen. @MOB3","Classification"]
    ratios=[2.5,1.05,1.05,1.05,1.1,1.25,1.1,1.85]
    aligns=[LEFT,RIGHT,RIGHT,RIGHT,RIGHT,RIGHT,RIGHT,LEFT]
    cls={"SGH":("Fix acquisition","acq"),"UAE":("Fix acquisition","acq"),"INM":("Fix conversion","conv"),
         "AOC":("Scale what works","scale"),"MYH":("Fix conversion","conv"),"TWN":("Scale what works","scale"),
         "CIIOM":("Clean up","clean"),"US":("Full intervention","full"),"MX":("Scale what works","scale"),
         "IWPB9":("Fix conversion","conv")}
    rows=[]; grp=set(); tot=set()
    order=[("Priority Growth Markets",None,"grp"),("SGH","Singapore (SGH)","d"),("UAE","UAE","d"),("INM","India (INM)","d"),("AOC","AOC","d"),
           ("Wealth & International Connectivity",None,"grp"),("MYH","Malaysia (MYH)","d"),("TWN","Taiwan (TWN)","d"),
           ("CIIOM","Channel Is. (CIIOM)","d"),("US","US","d"),("MX","Mexico (MX)","d"),("IWPB9","IWPB-9 Markets","t")]
    for idx,item in enumerate(order):
        if item[2]=="grp":
            rows.append([item[0]]+[""]*7); grp.add(idx); continue
        k=item[0]; lbl=item[1]
        gap=50-PEN[k][6]; gaps=("+" if gap>0 else "−")+f"{abs(gap):.1f}"
        ct=cls[k][0]
        rows.append([lbl,pct(PEN[k][0]),pct(PEN[k][2]),pct(PEN[k][6]),gaps,pct(QUAL[k][2]),pct(MOB3[k][2]),ct])
        if item[2]=="t": tot.add(idx)
    g=table(s,0.75,1.95,11.85,heads,rows,ratios,aligns,group_rows=grp,total_rows=tot,rowh=0.315,body=9.5)
    line(tbox(s,0.75,6.72,11.85,0.4),
         "Regions at 2030: Asia 46.2% · Americas & EU 40.4% · Middle East 30.8%. Classification maps each market to its dominant broken stage — the funnel diagnostic before prescribing a solution.",
         size=9.5,color=MUTED,italic=True,first=True,sa=0)
    foot(s,3)

def divider(num_txt,big,title,body):
    s=slide(dark=True)
    line(tbox(s,0.85,2.3,11,0.4),big.upper(),size=14,color=GOLD,bold=True,first=True,sa=0)
    line(tbox(s,0.75,2.75,11,1.3),title,size=40,color=WHITE,bold=True,first=True,ls=1.02)
    line(tbox(s,0.85,4.35,10.5,1.4),body,size=16,color=C("b9c6d4"),first=True,ls=1.3)
    foot(s,"",dark=True)
    return s

def s6_ntb():
    s=slide(); header(s,"04","NTB diagnostic · new acquisition","Are we acquiring customers capable of driving wealth growth?")
    card(s,0.75,1.95,11.85,1.05,fill=MIST)
    tiles=[("22.0%","New-cohort penetration @MOB3 (2026) — vs 36.2% on-book"),
           ("~38–39%","TRB qualification @MOB3 — flat since 2024"),
           ("69,163","TRB per customer @MOB3 ($) — dipped to 62k in 2025"),
           ("$1,552m","TRB volume @MOB3 (2026 FRP)")]
    x=1.0
    for v,l in tiles:
        tf=tbox(s,x,2.14,2.85,0.75)
        line(tf,v,size=22,color=NAVY,bold=True,first=True,sa=2,ls=1.0)
        line(tf,l,size=9.5,color=MUTED,sa=0,ls=1.08)
        x+=2.96
    tests=[("A · Source quality",["Which channels generate funded, qualified, wealth-active customers?","Digital · branch · referral · international · mortgage · upgrade"]),
           ("B · Early-life funding",["TRB at MOB0/1/3/6","Funded within X days","Qualified within Y days"]),
           ("C · Wealth activation",["Penetration at MOB1/3/6","Investment account opened","First wealth product · NNIA"]),
           ("D · Sustainability",["Still qualified at MOB12","Downgraded / inactive","Returning vs new money"]),
           ("E · Economics",["Acquisition & offer cost","TRB & NNIA generated","Payback & EV by channel"])]
    x=0.75; w=2.28
    for ttl,items in tests:
        card(s,x,3.2,w,2.05,accent=NTB)
        tf=tbox(s,x+0.16,3.4,w-0.3,1.8)
        line(tf,ttl,size=11,color=NAVY,bold=True,first=True,sa=5,ls=1.05)
        for it in items: line(tf,"• "+it,size=9.5,color=INK,sa=4,ls=1.12)
        x+=2.365
    headline(s,0.75,5.45,11.85,
        "Verdict: we are acquiring the wrong quality — new cohorts qualify and activate at ~half the on-book rate, and MOB3 qualification is not improving. Acquisition, not just conversion, must be fixed (UAE & Singapore worst at ~10–11% MOB3).",
        fill=MIST,bar=NAVY,txt=NAVY)
    foot(s,4)

def s7_core5():
    s=slide(); header(s,"09","Proof point · IWPB Core-5 · MTD June Week 4","The engine can run — when the funnel is orchestrated")
    panels=[("NNM ($m)","1,189","MTD Jun W4 · vs PY 408 · Plan 1,190","+191% vs PY · (0)% to plan",GOLD,GOOD),
            ("Investment NNIA ($m)","1,101","MTD Jun W4 · vs PY 286 · Plan 834",">200% vs PY · +32% to plan",ETB,GOOD),
            ("Premier Net New Deposit ($m)","88","MTD Jun W4 · vs PY 122 · Plan 356","(28)% vs PY · (75)% to plan",CLEAN,BAD)]
    x=0.75; w=3.83
    for ttl,val,sub,note,acc,ncol in panels:
        card(s,x,2.05,w,2.15,accent=acc)
        tf=tbox(s,x+0.22,2.28,w-0.4,1.85)
        line(tf,ttl,size=13,color=NAVY,bold=True,first=True,sa=8)
        line(tf,val,size=34,color=NAVY,bold=True,sa=4,ls=1.0)
        line(tf,sub,size=10,color=MUTED,sa=8,ls=1.1)
        line(tf,note,size=11,color=ncol,bold=True,sa=0,ls=1.1)
        x+=4.05
    headline(s,0.75,4.5,11.85,
        "When acquisition quality is fixed, this is the upside: Week 4 delivered $1.1bn NNM, led by improved Investment NNIA (China Mutual Funds) and Premier deposits back in positive territory, aided by UAE salary-credit inflows.")
    line(tbox(s,0.75,5.55,11.85,0.6),
        "Core-5 = China, Singapore, Malaysia, Taiwan, UAE. By-market NNM: China 456 · UAE 538 · Taiwan 180 · Malaysia 37 · Singapore (22). Deposits still lag plan — the orchestration gap the ETB engine must close.",
        size=10,color=MUTED,italic=True,first=True,sa=0,ls=1.2)
    foot(s,9)

def s8_etb():
    s=slide(); header(s,"05","ETB diagnostic · existing customers","Where is investable money sitting — and why isn't it converting?")
    line(tbox(s,0.75,1.95,6,0.3),"Segment the ETB opportunity",size=13,color=NAVY,bold=True,first=True,sa=0)
    segs=["CASA idle cash","TD maturity / rollover","Wealth customers, top-up potential",
          "Qualified non-wealth customers","Near-qualified customers","High-propensity digital leads"]
    x=0.75;y=2.35
    for i,sg in enumerate(segs):
        cx=x+(i%2)*3.0; cy=y+(i//2)*0.66
        card(s,cx,cy,2.85,0.56,accent=ETB)
        tf=tbox(s,cx+0.15,cy+0.14,2.6,0.36); tf.vertical_anchor=MSO_ANCHOR.MIDDLE
        line(tf,sg,size=10.5,color=NAVY,bold=True,first=True,sa=0)
    card(s,0.75,4.4,5.85,1.0,fill=MIST)
    tf=tbox(s,0.95,4.55,5.5,0.8)
    runs(tf,[("Where the NNIA sits (May YTD, $mn): ",10.5,NAVY,True),
             ("Asia 5,867 · Americas & EU 516 (−794 vs plan) · Middle East 447 (−238 vs plan). Global mix skews to Mutual Funds (6.7bn) & Structured (5.9bn); Equities run negative.",10.5,INK,False)],first=True,ls=1.18)
    line(tbox(s,7.0,1.95,5.6,0.3),"Diagnose each segment through six lenses",size=13,color=NAVY,bold=True,first=True,sa=0)
    lenses=[("1","Opportunity size — how much addressable balance exists?"),
            ("2","Propensity — which customers are most likely to act?"),
            ("3","Trigger — maturity, liquidity event, browsing, intl movement."),
            ("4","Offer fit — is there a relevant hero product or solution?"),
            ("5","Execution — was the customer contacted, advised, converted?"),
            ("6","Persistence — did the NNIA remain, or was it recycled money?")]
    yy=2.4
    for n,txt in lenses:
        b=shp(s,MSO_SHAPE.ROUNDED_RECTANGLE,7.0,yy,0.42,0.42,fill=ETB,radius=0.25)
        b.text_frame.vertical_anchor=MSO_ANCHOR.MIDDLE
        line(b.text_frame,n,size=13,color=WHITE,bold=True,align=CENTER,first=True,sa=0)
        tf=tbox(s,7.6,yy+0.03,5.0,0.42); tf.vertical_anchor=MSO_ANCHOR.MIDDLE
        line(tf,txt,size=10.5,color=INK,first=True,sa=0,ls=1.08)
        yy+=0.5
    headline(s,0.75,5.7,11.85,
        "Verdict: the opportunity exists — Core-5 NNIA runs >200% vs PY — but Americas & EU and Middle East miss plan by $0.8bn and $0.2bn, and Premier deposits lag plan 75%. The failure is commercialisation and persistence, not raw opportunity.",
        fill=MIST,bar=NAVY,txt=NAVY)
    foot(s,5)

def s9_dilution():
    s=slide(); header(s,"06","Portfolio dilution diagnostic · value protection","What is structurally dragging penetration down?")
    line(tbox(s,0.75,1.95,6,0.3),"Sources of structural dilution",size=13,color=NAVY,bold=True,first=True,sa=0)
    card(s,0.75,2.32,5.85,2.15,accent=CLEAN)
    tf=tbox(s,0.95,2.5,5.5,1.95)
    for it in ["Customers below the qualification threshold","Grace-period & persistently inactive Premier customers",
               "Re-upgraded customers with no incremental value","P1PA / multi-market customers with unclear qualification",
               "Low-value customers consuming RM capacity","Upgrade–downgrade recyclers",
               "Markets improving penetration only by denominator reduction"]:
        line(tf,"▸ "+it,size=10.5,color=INK,first=(it.startswith("Customers")),sa=5,ls=1.1)
    card(s,0.75,4.62,5.85,1.55,fill=CLEANS,ln=None)
    tf=tbox(s,0.95,4.78,5.5,1.3)
    runs(tf,[("Data flags: ",10.5,C("7a2f14"),True),
             ("CIIOM swings 0→18→14→20% and TRB-qual 38→51→42% — denominator noise. US stuck ~17–23% on a 300k+ book. Revenue per customer is flat (2,022→2,025) while TRB per customer rises — value isn't converting to revenue.",10.5,C("7a2f14"),False)],first=True,ls=1.18)
    line(tbox(s,7.0,1.95,5.6,0.3),"A simple portfolio classification",size=13,color=NAVY,bold=True,first=True,sa=0)
    cats=[("Grow","Clear upside; invest.",GOOD),("Convert","Credible near-term path.",NTB),
          ("Retain","Valuable; protect.",ETB),("Migrate","Right-fit service model.",WARN),
          ("Downgrade","Persistently unqualified.",CLEAN),("Exit / inactive","No credible path.",BAD)]
    for i,(t,d,col) in enumerate(cats):
        cx=7.0+(i%2)*2.9; cy=2.35+(i//2)*0.7
        card(s,cx,cy,2.75,0.6,accent=col)
        tf=tbox(s,cx+0.15,cy+0.11,2.5,0.42)
        line(tf,t,size=11,color=col,bold=True,first=True,sa=1)
        line(tf,d,size=9,color=MUTED,sa=0,ls=1.0)
    headline(s,7.0,4.62,5.6,"Which customers have a credible path to value, and which are permanently diluting the portfolio?",
             fill=MIST,bar=NAVY,txt=NAVY)
    foot(s,6)

def s7_bottleneck():
    s=slide(); header(s,"07","Isolate the true bottleneck","The true bottleneck is acquisition quality")
    line(tbox(s,0.75,1.9,6.9,0.85),
         "Three stages leak, but they are not equal. On-book conversion and clean-up move the ratio at the margin; the largest and most persistent leak is low-quality inflow entering at roughly half the on-book wealth rate and diluting the mix every year.",
         size=12.5,color=INK,first=True,sa=0,ls=1.2)
    def bar(y,label,val,color):
        line(tbox(s,0.75,y+0.06,1.7,0.3),label,size=11,color=NAVY,bold=True,first=True,sa=0)
        track_w=4.8
        shp(s,MSO_SHAPE.ROUNDED_RECTANGLE,2.55,y,track_w,0.34,fill=MIST,radius=0.14)
        fw=track_w*val/50.0
        shp(s,MSO_SHAPE.ROUNDED_RECTANGLE,2.55,y,fw,0.34,fill=color,radius=0.14)
        t=tbox(s,2.55,y+0.05,fw-0.12,0.26); t.vertical_anchor=MSO_ANCHOR.MIDDLE
        line(t,f"{val}%",size=11,color=WHITE,bold=True,align=RIGHT,first=True,sa=0)
    bar(2.95,"New cohort @MOB3",22,BAD)
    bar(3.55,"On-book (MOB4+)",36,NTB)
    bar(4.15,"2030 ambition",50,GOLD)
    line(tbox(s,0.75,4.75,6.9,0.6),
         "MOB3 qualification flat at ~38–39% since 2024; TRB per new customer dipped in 2025. Every vintage acquired at 22% pulls the on-book average down before conversion can lift it.",
         size=9.5,color=MUTED,italic=True,first=True,sa=0,ls=1.15)
    line(tbox(s,8.0,1.9,4.6,0.3),"Rank the levers by leverage",size=13,color=NAVY,bold=True,first=True,sa=0)
    levers=[("PRIMARY LEVER","NTB · acquisition quality","Largest, most persistent drag. Fix first — raise the MOB3 line toward on-book, or the gap never closes.",NTB,NTBS),
            ("ACCELERANT","ETB · on-book conversion","Real, provable momentum (NNIA >200% vs PY) — but it cannot outrun continuous low-quality inflow on its own.",ETB,ETBS),
            ("GUARDRAIL","Clean-up · dilution","Protects the ratio and RM capacity — but cannot be the primary route to 50%.",CLEAN,CLEANS)]
    yy=2.3
    for tag,ttl,desc,col,soft in levers:
        card(s,8.0,yy,4.6,1.12,accent=col)
        pill(s,8.2,yy+0.16,1.15,tag,soft,col)
        line(tbox(s,9.45,yy+0.17,3.0,0.3),ttl,size=11.5,color=NAVY,bold=True,first=True,sa=0)
        line(tbox(s,8.2,yy+0.52,4.2,0.5),desc,size=9.5,color=MUTED,first=True,sa=0,ls=1.12)
        yy+=1.22
    headline(s,0.75,5.75,11.85,
        "Move the MOB3 line toward the on-book line and the 2030 gap closes. Keep acquiring at 22%, and no amount of on-book conversion catches up.")
    foot(s,7)

def action_cards(s,rows3):
    x=0.75;w=3.83
    for ttl,items,acc in rows3:
        card(s,x,2.0,w,2.7,accent=acc)
        tf=tbox(s,x+0.18,2.2,w-0.32,2.4)
        line(tf,ttl,size=12.5,color=NAVY,bold=True,first=True,sa=6,ls=1.05)
        for it in items: line(tf,"• "+it,size=10.5,color=INK,sa=5,ls=1.14)
        x+=4.05

def s10_ntb_action():
    s=slide(); header(s,"08","NTB action plan · the isolated bottleneck","Make acquisition the first quality-control point")
    action_cards(s,[
      ("1 · Define “good NTB”",["funded within X days","TRB qualified within Y days","generates NNIA within Z days","stays qualified past early life","target: MOB3 pen. 22% → 36%"],NTB),
      ("2 · Quality gates",["by market · channel · campaign","by proposition · product hook","by customer source"],NTB),
      ("3 · Separate acquisition from conversion",["acquired · funded · qualified","wealth activated","NNIA producing · sustained"],NTB)])
    card(s,0.75,4.95,5.85,1.55,accent=NTB)
    tf=tbox(s,0.95,5.13,5.5,1.3)
    line(tf,"4 · Reallocate acquisition investment",size=12,color=NAVY,bold=True,first=True,sa=5)
    for it in ["Scale high-quality channels (AOC-type, MOB3 pen. 45%)","Redesign weak channels (UAE/SGH MOB3 ~10%)","Stop persistently dilutive acquisition"]:
        line(tf,"• "+it,size=10.5,color=INK,sa=4,ls=1.12)
    card(s,6.75,4.95,5.85,1.55,accent=NTB)
    tf=tbox(s,6.95,5.13,5.5,1.3)
    line(tf,"5 · Build hero conversion pathways",size=12,color=NAVY,bold=True,first=True,sa=5)
    for it in ["TD hook → income / yield solution","International (UAE salary credits) → offshore activation","Mortgage → investable balance · Card-only → funded Premier"]:
        line(tf,"• "+it,size=10.5,color=INK,sa=4,ls=1.12)
    foot(s,8)

def s11_etb_action():
    s=slide(); header(s,"10","ETB action plan","Convert addressable balances into sustainable NNIA")
    steps=[("1 · Identify","Customer-level opportunity pools."),("2 · Prioritise","Balance × propensity × trigger × EV."),
           ("3 · Nurture","Engage before the event — esp. TD maturity."),("4 · Match","A few relevant propositions, not broad pushing."),
           ("5 · Route","Digital · RM · specialist · campaign."),("6 · Convert","Appointment → recommendation → NNIA."),
           ("7 · Retain","Does flow remain at 3/6/12 months?")]
    x=0.75; w=1.64
    for ttl,desc in steps:
        card(s,x,2.1,w,2.3,accent=ETB)
        tf=tbox(s,x+0.12,2.3,w-0.22,2.0)
        line(tf,ttl,size=11.5,color=NAVY,bold=True,first=True,sa=6,ls=1.05)
        line(tf,desc,size=9.5,color=INK,sa=0,ls=1.14)
        x+=1.695
    headline(s,0.75,4.9,11.85,
        "Run ETB as an orchestrated funnel — a Speed-to-Lead-style cadence (contact fast, nurture before the liquidity event), not isolated campaigns and uncoordinated leads. Close the deposit-to-plan gap (Premier NND at 25% of plan).")
    foot(s,10)

def s12_cleanup():
    s=slide(); header(s,"11","Portfolio clean-up action plan","Remove structural dilution — without gaming the denominator")
    action_cards(s,[
      ("A · Reaffirm eligibility",["Qualification rules","Grace periods","International / multi-market treatment","Upgrade & downgrade rules"],CLEAN),
      ("B · Apply disciplined actions",["Retain high-potential customers","Migrate to appropriate service models","Downgrade persistently unqualified","Protect credible recovery paths"],CLEAN),
      ("C · Prevent re-entry",["Stop upgrade–downgrade recycling (CIIOM)","Minimum quality thresholds on upgrades","Review origin & performance of upgrades"],CLEAN)])
    headline(s,0.75,5.05,11.85,
        "Guardrail — Clean-up supports portfolio health, but it cannot be the primary route to 50%. The denominator must fall because customers genuinely leave the segment, not to flatter the ratio.",
        fill=CLEANS,bar=CLEAN,txt=C("7a2f14"))
    foot(s,11)

def s13_roadmap():
    s=slide(); header(s,"12","Integrated action roadmap","Three levers, one sequenced view to 2030")
    heads=["Horizon","NTB","ETB","Clean-up"]
    ratios=[1.4,3.5,3.5,3.0]; aligns=[LEFT,LEFT,LEFT,LEFT]
    rows=[["Now – year end","Define quality; start channel & vintage reporting; lift MOB3 penetration.","Priority balance campaigns; TD nurturing; convert Core-5 momentum to deposits.","Validate qualification & downgrade rules; fix CIIOM-type noise."],
          ["Next year","Reallocate acquisition spend; redesign UAE/SGH channels.","Industrialise propensity, orchestration & RM routing.","Embed recurring portfolio governance."],
          ["To 2030","Sustain high-quality inflow (MOB3 pen → on-book).","Repeatable NNIA growth engine; close US penetration gap.","Maintain portfolio purity & capacity."]]
    g=s.shapes.add_table(4,4,Inches(0.75),Inches(2.0),Inches(11.85),Inches(2.7)).table
    clear_table_style(g)
    tot=sum(ratios)
    for j,r in enumerate(ratios): g.columns[j].width=Inches(11.85*r/tot)
    g.rows[0].height=Inches(0.34)
    for j,h in enumerate(heads):
        cell(g.cell(0,j),h,11,WHITE,bold=True,fill=NAVY,align=LEFT)
    for i,row in enumerate(rows,start=1):
        g.rows[i].height=Inches(0.75)
        for j,val in enumerate(row):
            cell(g.cell(i,j),val,10,(NAVY if j==0 else INK),bold=(j==0),fill=(MIST if j==0 else WHITE),align=LEFT)
    card(s,0.75,4.95,11.85,1.35,fill=MIST)
    line(tbox(s,0.95,5.1,11.4,0.3),"Every action carries a complete decision record",size=12.5,color=NAVY,bold=True,first=True,sa=6)
    fields=["Baseline","Target","Owner","Delivery date","Financial impact","Data dependency","Decision required"]
    x=0.95
    for f in fields:
        line(tbox(s,x,5.5,1.6,0.6),f,size=10,color=NAVY,bold=True,first=True,sa=0,ls=1.05)
        x+=1.66
    foot(s,12)

def s14_measure():
    s=slide(); header(s,"13","Measurement & management loop","A monthly cockpit that closes the loop")
    cols=[("NTB",NTB,NTBS,["Funded rate","TRB-qualified rate @MOB3","Penetration @MOB3 / MOB6","NNIA per acquired customer","Qualification retention @MOB12"]),
          ("ETB",ETB,ETBS,["Addressable balance","Customers contacted","Recommendations delivered","Conversion rate","NNIA generated · flow retained"]),
          ("Portfolio",CLEAN,CLEANS,["Qualified customer rate","Wealth penetration","Downgrade / inactive rate","Wealth customer growth","Revenue & NNIA per qual. cust."])]
    x=0.75;w=3.83
    for tag,col,soft,items in cols:
        card(s,x,2.0,w,2.55,accent=col)
        pill(s,x+0.18,2.2,0.95,tag.upper(),soft,col)
        tf=tbox(s,x+0.18,2.62,w-0.34,1.85)
        for it in items: line(tf,"• "+it,size=10.5,color=INK,first=(it==items[0]),sa=5,ls=1.14)
        x+=4.05
    shp(s,MSO_SHAPE.ROUNDED_RECTANGLE,0.75,4.8,11.85,1.5,fill=NAVY,radius=0.05)
    line(tbox(s,1.0,4.98,11,0.3),"For every red metric — the management decision",size=12.5,color=WHITE,bold=True,first=True,sa=0)
    nodes=["Diagnosed bottleneck?","Action underway?","When is the hypothesis tested?","What stops if it fails?"]
    x=1.0
    for i,n in enumerate(nodes):
        b=shp(s,MSO_SHAPE.ROUNDED_RECTANGLE,x,5.45,2.55,0.6,fill=C("0f2a44"),ln=C("1d3a57"))
        b.text_frame.vertical_anchor=MSO_ANCHOR.MIDDLE; b.text_frame.word_wrap=True
        line(b.text_frame,n,size=10.5,color=WHITE,bold=True,align=CENTER,first=True,sa=0,ls=1.02)
        if i<3:
            line(tbox(s,x+2.6,5.5,0.35,0.5),"→",size=18,color=GOLD,bold=True,align=CENTER,first=True,sa=0)
        x+=2.92
    line(tbox(s,0.75,6.5,11.85,0.3),"A dialer.io-style reporting cockpit: read the funnel monthly, and drive every red metric back to a diagnosed bottleneck and a dated hypothesis.",
         size=9,color=MUTED,italic=True,first=True,sa=0)
    foot(s,13)

def s15_decisions():
    s=slide(dark=True); header(s,"14","Executive decisions required","Seven decisions to put us on the path to 50%",dark=True)
    decs=["Confirm 50% wealth penetration as the governing ambition and agree the horizon — the FRP currently lands at 42.8%.",
          "Agree the minimum NTB quality standard and a MOB3 penetration target above today's 22%.",
          "Mandate channel- and vintage-level reporting.",
          "Establish one accountable owner for ETB commercialisation.",
          "Approve disciplined portfolio clean-up rules — with the denominator guardrail.",
          "Require each market to submit a quantified path to 50% (US, UAE, CIIOM first).",
          "Embed the actions into FRP before the planning cycle closes."]
    y=1.98
    for i,d in enumerate(decs,1):
        shp(s,MSO_SHAPE.ROUNDED_RECTANGLE,0.75,y,11.85,0.66,fill=C("0f2a44"),ln=C("1d3a57"))
        b=shp(s,MSO_SHAPE.ROUNDED_RECTANGLE,0.92,y+0.16,0.36,0.36,fill=GOLD,radius=0.22)
        b.text_frame.vertical_anchor=MSO_ANCHOR.MIDDLE
        line(b.text_frame,str(i),size=13,color=NAVY,bold=True,align=CENTER,first=True,sa=0)
        tf=tbox(s,1.45,y+0.12,10.9,0.44); tf.vertical_anchor=MSO_ANCHOR.MIDDLE
        line(tf,d,size=12,color=C("eaf0f6"),first=True,sa=0,ls=1.06)
        y+=0.735
    foot(s,14,dark=True)

# ---------- APPENDIX ----------
def app_divider():
    return divider("","Appendix","Data, definitions & taxonomy",
        "Full per-market FRP trajectories (2024–2030), the three-taxonomy mapping key, the rendered penetration chart, and source notes. Figures transcribed from the 16 Jul 2026 pack — verify against the source workbook before external use.")

def a1_taxonomy():
    s=slide(); header(s,"A1","Appendix · taxonomy mapping key","Reconciling the three market views in the pack")
    line(tbox(s,0.75,1.95,11.85,0.5),
        "The pack uses three different market taxonomies. The deck leads on IWPB-9 (FRP) with a Core-5 momentum callout. This key reconciles them.",
        size=11,color=MUTED,italic=True,first=True,sa=0,ls=1.15)
    heads=["IWPB-9 FRP code","Market","In Core-5 (NNM MTD)?","In NNIA product tree (region)"]
    ratios=[2.0,2.6,2.4,4.0]; aligns=[LEFT,LEFT,LEFT,LEFT]
    rows=[["Priority Growth Markets","","",""],
          ["SGH","Singapore","Yes","IWPB Asia"],
          ["UAE","United Arab Emirates","Yes","IWPB Middle East"],
          ["INM","India","(India N/A in Core-5)","IWPB Asia"],
          ["AOC","AOC — confirm decode*","—","(China / others under IWPB Asia)*"],
          ["Wealth & International Connectivity","","",""],
          ["MYH","Malaysia","Yes","IWPB Asia"],
          ["TWN","Taiwan","Yes","IWPB Asia"],
          ["CIIOM","Channel Islands & Isle of Man","—","IWPB Americas & Europe (Channel Is.)"],
          ["US","United States","—","IWPB Americas & Europe"],
          ["MX","Mexico","—","IWPB Americas & Europe"],
          ["— (not a single FRP line)","China","Yes (largest Core-5 driver)","IWPB Asia"]]
    grp={0,5}
    table(s,0.75,2.55,11.85,heads,rows,ratios,aligns,group_rows=grp,rowh=0.315,body=10)
    line(tbox(s,0.75,6.75,11.85,0.5),
        "* AOC appears as an FRP Priority-Growth code but its decode is not stated in the pack; China is explicit in the NNM/NNIA views but not a standalone FRP priority line. Confirm the AOC↔China/other mapping with the source workbook. NNIA tree also carries AMH, HASE and UK RFB entities outside IWPB-9.",
        size=8.5,color=MUTED,italic=True,first=True,sa=0,ls=1.15)
    foot(s,"A1")

def full_table_slide(code,metric_dict,title,kicker,fmt,note,page):
    s=slide(); header(s,code,kicker,title)
    heads=["Market"]+YEARS
    ratios=[2.6]+[1.0]*7; aligns=[LEFT]+[RIGHT]*7
    rows=[]; grp=set(); tot=set()
    for idx,(lbl,key,kind) in enumerate(MKT_ROWS):
        if kind=="grp": rows.append([lbl]+[""]*7); grp.add(idx); continue
        vals=metric_dict.get(key,[None]*7)
        rows.append([lbl]+[(fmt(v) if v is not None else "—") for v in vals])
        if kind=="t": tot.add(idx)
    table(s,0.75,1.95,11.85,heads,rows,ratios,aligns,group_rows=grp,total_rows=tot,rowh=0.29,body=9.5)
    line(tbox(s,0.75,6.75,11.85,0.4),note,size=9,color=MUTED,italic=True,first=True,sa=0,ls=1.1)
    foot(s,page)

def a4_mob3_cust():
    s=slide(); header(s,"A4","Appendix · active customers & new-cohort quality","Volume grows; early-life quality lags")
    # active customers table (left) full 7 yr
    heads=["Market"]+YEARS
    ratios=[2.0]+[0.86]*7; aligns=[LEFT]+[RIGHT]*7
    rows=[];grp=set();tot=set()
    for idx,(lbl,key,kind) in enumerate(MKT_ROWS):
        if kind=="grp": rows.append([lbl]+[""]*7); grp.add(idx); continue
        vals=CUST.get(key)
        rows.append([lbl]+[f"{v/1000:,.0f}k" for v in vals])
        if kind=="t": tot.add(idx)
    line(tbox(s,0.75,1.9,7,0.28),"Active customers (000s)",size=11,color=NAVY,bold=True,first=True,sa=0)
    table(s,0.5,2.2,7.6,heads,rows,ratios,aligns,group_rows=grp,total_rows=tot,rowh=0.285,body=8.5,hsize=7.5)
    # MOB3 penetration (right, 3 yrs)
    line(tbox(s,8.4,1.9,4.5,0.28),"New-cohort penetration @MOB3",size=11,color=NAVY,bold=True,first=True,sa=0)
    heads2=["Market","2024","2025","2026"]; r2=[2.0,1,1,1]; a2=[LEFT,RIGHT,RIGHT,RIGHT]
    rows2=[];grp2=set();tot2=set()
    for idx,(lbl,key,kind) in enumerate(MKT_ROWS):
        short=lbl.split(" (")[0]
        if kind=="grp": rows2.append([short]+[""]*3); grp2.add(idx); continue
        v=MOB3.get(key); rows2.append([short]+[pct(x) for x in v])
        if kind=="t": tot2.add(idx)
    table(s,8.2,2.2,4.6,heads2,rows2,r2,a2,group_rows=grp2,total_rows=tot2,rowh=0.285,body=8.5,hsize=7.5)
    line(tbox(s,0.75,6.75,11.85,0.4),
        "Active customers plan +9.6% CAGR to 2030 (2.86m); Middle East fastest at +15.3%. Yet new-cohort penetration @MOB3 tops out at 22% — the acquisition-quality gap.",
        size=9,color=MUTED,italic=True,first=True,sa=0,ls=1.1)
    foot(s,"A4")

def a5_nnia():
    s=slide(); header(s,"A5","Appendix · NNIA by region & Core-5 momentum","Investment NNIA (May YTD) and MTD June Week 4")
    heads=["Region (IWPB)","2025 Actual","2026 Plan","Act vs Plan","2026 Actual*"]
    ratios=[3.0,1.6,1.6,1.6,1.6]; aligns=[LEFT,RIGHT,RIGHT,RIGHT,RIGHT]
    rows=[["IWPB Asia","5,397.9","5,563.1","+303.9","5,867.0"],
          ["IWPB Middle East (UAE)","367.2","685.7","−238.4","447.3"],
          ["IWPB Americas & Europe","1,086.3","1,309.4","−793.6","515.8"],
          ["IWPB ex AMH/HASE/UK","6,851.4","7,558.2","−728.1","6,830.1"],
          ["AMH","8,474.9","14,218.1","+3,660.3","17,878.4"],
          ["HASE","1,670.8","2,601.3","−455.9","2,145.4"],
          ["Global","16,761.6","24,927.3","+2,572.1","27,499.4"]]
    table(s,0.75,2.15,7.0,heads,rows,ratios,aligns,total_rows={6},rowh=0.34,body=9.5)
    line(tbox(s,0.75,4.85,7.0,0.4),"* 2026 Actual derived = Plan + (Actuals vs Plan); reconciles with Actuals-vs-2025 variance. $mn.",
         size=8.5,color=MUTED,italic=True,first=True,sa=0,ls=1.1)
    # Core-5 momentum mini
    line(tbox(s,8.1,2.0,4.5,0.28),"Core-5 · MTD June Week 4 ($m)",size=11,color=NAVY,bold=True,first=True,sa=0)
    mh=["Panel","W4","PY","Plan"]; mr=[2.2,1,1,1]; ma=[LEFT,RIGHT,RIGHT,RIGHT]
    mrows=[["NNM","1,189","408","1,190"],["Investment NNIA","1,101","286","834"],["Premier NND","88","122","356"]]
    table(s,8.0,2.35,4.8,mh,mrows,mr,ma,rowh=0.34,body=9.5)
    headline(s,8.0,3.9,4.8,"Week 4: $1.1bn NNM, +191% vs PY; deposits still (75)% to plan.",fill=MIST,bar=GOLD,txt=NAVY)
    foot(s,"A5")

def a6_sources():
    s=slide(); header(s,"A6","Appendix · penetration chart & sources","Rendered trajectory and data provenance")
    if os.path.exists(CHART_IMG):
        s.shapes.add_picture(CHART_IMG,Inches(0.6),Inches(2.0),width=Inches(7.6))
    line(tbox(s,8.5,2.0,4.1,0.3),"Sources",size=12,color=NAVY,bold=True,first=True,sa=4)
    tf=tbox(s,8.5,2.4,4.1,3.6)
    for t in ["Wealth NNIA Actuals pack — May YTD 2026 (refresh 17/6/2026)",
              "FRP tables: wealth penetration %, TRB-qualifiers % / #, TRB per customer, TRB volume, active customers, revenue per customer (portfolio MOB4+ and @MOB3)",
              "NNM MTD chart — 'Growing IWPB Wealth NNM', June Week 4 (Core-5)",
              "NNIA product split — Global May YTD 2025/2026 actuals, plan, variance"]:
        line(tf,"• "+t,size=10,color=INK,first=(t.startswith("Wealth NNIA")),sa=6,ls=1.15)
    line(tf,"Caveat",size=11,color=CLEAN,bold=True,sb=6,sa=3)
    line(tf,"All figures transcribed from screenshots; a few cells read from low-resolution captures. Verify against the source workbook before external use. Internal cross-checks (NNIA: 2025A + variance = Plan + Act-vs-Plan) reconcile.",
         size=9.5,color=MUTED,italic=True,sa=0,ls=1.18)
    foot(s,"A6")

# ---- build ----
s0_title(); s1_define_gap(); s3_funnel()
divider("","Section I · Diagnostic","Diagnose the funnel before prescribing a fix",
    "Three diagnoses, one architecture. Are we acquiring the wrong customers — or the right customers we fail to convert? Do we lack opportunity on-book — or fail to commercialise it? And which customers are permanently diluting the portfolio?")
s4_scorecard(); s6_ntb(); s8_etb(); s9_dilution(); s7_bottleneck()
divider("","Section II · Action","Act on the true bottleneck — quality first",
    "Fix contactability before blaming conversion. Make acquisition the first quality-control point, prove the engine can run, run ETB as an orchestrated conversion engine, and remove structural dilution without gaming the denominator.")
s10_ntb_action(); s7_core5(); s11_etb_action(); s12_cleanup(); s13_roadmap(); s14_measure(); s15_decisions()
app_divider(); a1_taxonomy()
full_table_slide("A2",PEN,"Wealth penetration % — full trajectory","Appendix · wealth penetration (portfolio MOB4+)",pct,
    "Portfolio MOB4+, 2024 Actuals → 2030 FRP. IWPB-9 reaches 42.8% vs 50% ambition. MX only market above 50%; US furthest below.","A2")
full_table_slide("A3",QUAL,"TRB qualifiers % — full trajectory","Appendix · TRB qualifiers (portfolio MOB4+)",pct,
    "Portfolio MOB4+. Qualification improves to 58.1% by 2030 but penetration lags — the qualify→activate→retain gap.","A3")
a4_mob3_cust(); a5_nnia(); a6_sources()

out=os.path.join(HERE,"Wealth-Penetration-Funnel.pptx")
prs.save(out)
print("saved",out,"slides:",len(prs.slides._sldIdLst))
