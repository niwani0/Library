#!/usr/bin/env python3
"""Build the 2-page 'Acquisition model & strategy' deep-dive as a native .pptx.

Standalone companion to the main Wealth Penetration Funnel deck — double-clicks
on the NTB acquisition operating model (page 1) and the acquisition strategy
(page 2). Data source of truth: data.md.
"""
import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

HERE=os.path.dirname(os.path.abspath(__file__))
def C(h): return RGBColor(int(h[0:2],16),int(h[2:4],16),int(h[4:6],16))
NAVY=C("0b1e34"); INK=C("10202e"); GOLD=C("c9962f"); GOLDSOFT=C("f3e4c0"); GOLDINK=C("6b4d13")
MUTED=C("5c6b7a"); LINE=C("dde3ea"); MIST=C("f4f6f9"); WHITE=C("ffffff")
NTB=C("1f6feb"); NTBS=C("e3eefb"); ETB=C("0f9488"); CLEAN=C("b4562b")
GOOD=C("1f8a4c"); BAD=C("c0392b")
LEFT,CENTER,RIGHT=PP_ALIGN.LEFT,PP_ALIGN.CENTER,PP_ALIGN.RIGHT
FONT="Segoe UI"

prs=Presentation(); prs.slide_width=Inches(13.333); prs.slide_height=Inches(7.5)
BLANK=prs.slide_layouts[6]

def slide():
    s=prs.slides.add_slide(BLANK)
    s.background.fill.solid(); s.background.fill.fore_color.rgb=WHITE
    return s
def tbox(s,l,t,w,h):
    tb=s.shapes.add_textbox(Inches(l),Inches(t),Inches(w),Inches(h)); tf=tb.text_frame
    tf.word_wrap=True; tf.margin_left=0; tf.margin_right=0; tf.margin_top=0; tf.margin_bottom=0
    return tf
def line(tf,text,size=14,color=INK,bold=False,italic=False,align=LEFT,first=False,sa=3,sb=0,ls=1.08):
    p=tf.paragraphs[0] if first else tf.add_paragraph()
    p.alignment=align; p.space_after=Pt(sa); p.space_before=Pt(sb)
    if ls: p.line_spacing=ls
    r=p.add_run(); r.text=text; f=r.font
    f.size=Pt(size); f.bold=bold; f.italic=italic; f.name=FONT; f.color.rgb=color
    return p
def runs(tf,segs,align=LEFT,first=False,sa=3,sb=0,ls=1.12):
    p=tf.paragraphs[0] if first else tf.add_paragraph()
    p.alignment=align; p.space_after=Pt(sa); p.space_before=Pt(sb); p.line_spacing=ls
    for text,size,color,bold in segs:
        r=p.add_run(); r.text=text; f=r.font
        f.size=Pt(size); f.color.rgb=color; f.bold=bold; f.name=FONT
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
def card(s,l,t,w,h,accent=None,fill=WHITE,ln=LINE):
    shp(s,MSO_SHAPE.ROUNDED_RECTANGLE,l,t,w,h,fill=fill,ln=ln,lw=0.75,radius=0.05)
    if accent: shp(s,MSO_SHAPE.ROUNDED_RECTANGLE,l+0.04,t-0.02,w-0.08,0.08,fill=accent,radius=0.5)
def headline(s,l,t,w,h,text,fill=GOLDSOFT,bar=GOLD,txt=GOLDINK,size=13.5):
    shp(s,MSO_SHAPE.ROUNDED_RECTANGLE,l,t,w,h,fill=fill,radius=0.05)
    shp(s,MSO_SHAPE.RECTANGLE,l,t,0.06,h,fill=bar)
    tf=tbox(s,l+0.22,t+0.1,w-0.4,h-0.2); tf.vertical_anchor=MSO_ANCHOR.MIDDLE
    line(tf,text,size=size,color=txt,bold=True,first=True,sa=0,ls=1.18)
def deep_head(s,pg,kicker,title):
    b=shp(s,MSO_SHAPE.ROUNDED_RECTANGLE,0.6,0.45,2.7,0.34,fill=NAVY,radius=0.16)
    b.text_frame.vertical_anchor=MSO_ANCHOR.MIDDLE
    line(b.text_frame,f"Acquisition deep-dive · {pg} / 2",size=11.5,color=WHITE,bold=True,align=CENTER,first=True,sa=0)
    line(tbox(s,0.62,0.9,11,0.28),kicker.upper(),size=11,color=GOLD,bold=True,first=True,sa=0)
    line(tbox(s,0.6,1.18,12.2,0.8),title,size=30,color=NAVY,bold=True,first=True,ls=1.02)
def foot(s,pg):
    line(tbox(s,0.6,7.05,8,0.3),"PREMIER WEALTH · ACQUISITION MODEL & STRATEGY",size=8,color=MUTED,first=True,sa=0)
    line(tbox(s,12.1,7.05,0.6,0.3),f"{pg} / 2",size=8,color=MUTED,align=RIGHT,first=True,sa=0)

# ---------------- PAGE 1 · THE MODEL ----------------
def page1():
    s=slide(); deep_head(s,1,"The operating model","Acquisition is the first quality-control point")
    runs(tbox(s,0.6,2.02,12.1,0.3),
         [("What makes an NTB customer “good”?  ",13,NAVY,True),
          ("Not an account opened — a customer who clears early-life quality gates.",11,MUTED,False)],first=True,sa=0)
    gates=[("1 · Funded","Money in within X days of onboarding."),
           ("2 · TRB-qualified","Crosses the threshold within Y days."),
           ("3 · Wealth-activated","First wealth product / NNIA within Z days."),
           ("4 · Sustained","Still qualified at MOB12 — not a spike.")]
    x=0.6; w=2.86
    for ttl,desc in gates:
        card(s,x,2.42,w,0.92,accent=NTB)
        tf=tbox(s,x+0.15,2.56,w-0.28,0.72)
        line(tf,ttl,size=12,color=NAVY,bold=True,first=True,sa=4)
        line(tf,desc,size=10,color=MUTED,sa=0,ls=1.12)
        x+=3.01
    # left: bars
    line(tbox(s,0.6,3.65,6,0.3),"Close the early-life quality gap",size=13.5,color=NAVY,bold=True,first=True,sa=0)
    def bar(y,label,val,color):
        line(tbox(s,0.6,y+0.04,1.7,0.3),label,size=11,color=NAVY,bold=True,first=True,sa=0)
        tw=3.7
        shp(s,MSO_SHAPE.ROUNDED_RECTANGLE,2.35,y,tw,0.3,fill=MIST,radius=0.16)
        fw=tw*val/50.0
        shp(s,MSO_SHAPE.ROUNDED_RECTANGLE,2.35,y,fw,0.3,fill=color,radius=0.16)
        t=tbox(s,2.35,y+0.03,fw-0.1,0.24); t.vertical_anchor=MSO_ANCHOR.MIDDLE
        line(t,f"{val}%",size=11,color=WHITE,bold=True,align=RIGHT,first=True,sa=0)
    bar(4.08,"New cohort @MOB3",22,BAD)
    bar(4.5,"On-book (MOB4+)",36,NTB)
    line(tbox(s,0.6,4.95,6.0,0.9),
         "The model's job: lift new-cohort penetration toward the on-book rate in the first 3–6 months. Every vintage acquired at 22% dilutes the book before conversion can lift it. MOB3 qualification is flat at ~38–39%; TRB per new customer ~$69k (dipped to $62k in 2025).",
         size=9.5,color=MUTED,italic=True,first=True,sa=0,ls=1.18)
    # right: source-quality archetypes
    line(tbox(s,7.0,3.65,5.7,0.3),"Source quality is the lever",size=13.5,color=NAVY,bold=True,first=True,sa=0)
    arch=[("SCALE",GOOD,"High-quality channels","— AOC-type, 45% MOB3 penetration. Fund and expand."),
          ("REDESIGN",CLEAN,"Weak channels","— UAE / Singapore, ~10% MOB3 penetration. Rework the hook and journey."),
          ("STOP",BAD,"Persistently dilutive","acquisition — reallocate the spend to quality.")]
    y=4.05
    for lab,col,head,rest in arch:
        line(tbox(s,7.0,y,1.15,0.3),lab,size=11,color=col,bold=True,first=True,sa=0)
        runs(tbox(s,8.1,y,4.6,0.6),[(head+" ",10.5,NAVY,True),(rest,10.5,MUTED,False)],first=True,sa=0,ls=1.12)
        y+=0.62
    # hero pathways
    line(tbox(s,0.6,5.95,11,0.3),"Hero conversion pathways — a product hook per source",size=12.5,color=NAVY,bold=True,first=True,sa=0)
    paths=[("TD hook"," → income / yield solution"),("International"," (UAE salary) → offshore wealth"),
           ("Mortgage"," → investable balance conversion"),("Card-only"," → funded Premier & activation")]
    x=0.6; w=2.86
    for a,b in paths:
        shp(s,MSO_SHAPE.ROUNDED_RECTANGLE,x,6.3,w,0.5,fill=MIST,ln=LINE,radius=0.12)
        tf=tbox(s,x+0.13,6.38,w-0.24,0.36); tf.vertical_anchor=MSO_ANCHOR.MIDDLE
        runs(tf,[(a,10.5,NAVY,True),(b,10.5,INK,False)],first=True,sa=0,ls=1.05)
        x+=3.01
    foot(s,1)

# ---------------- PAGE 2 · THE STRATEGY ----------------
def page2():
    s=slide(); deep_head(s,2,"The strategy","Shift the mix from volume to wealth-capable quality")
    # left: from -> to
    line(tbox(s,0.6,2.02,5.7,0.3),"The strategic shift",size=13.5,color=NAVY,bold=True,first=True,sa=0)
    rows=[("Volume — accounts opened","Quality — funded, qualified, NNIA-generating"),
          ("All channels treated equally","Channels gated & funded by wealth quality"),
          ("Acquisition & conversion blurred","Separated, vintage-tracked funnels"),
          ("Spend by cost-per-acquisition","Spend by expected wealth value & payback"),
          ("“Good = account opened”","“Good = funded + qualified + activated + sustained”")]
    shp(s,MSO_SHAPE.RECTANGLE,0.6,2.36,5.75,0.26,fill=MIST)
    line(tbox(s,0.72,2.4,2.6,0.22),"FROM",size=9,color=MUTED,bold=True,first=True,sa=0)
    line(tbox(s,3.3,2.4,2.9,0.22),"TO",size=9,color=MUTED,bold=True,first=True,sa=0)
    y=2.64
    for frm,to in rows:
        line(tbox(s,0.72,y+0.03,2.5,0.5),frm,size=10,color=MUTED,first=True,sa=0,ls=1.08)
        line(tbox(s,3.3,y+0.03,3.0,0.5),to,size=10,color=NAVY,bold=True,first=True,sa=0,ls=1.08)
        yb=y+0.44
        shp(s,MSO_SHAPE.RECTANGLE,0.6,yb,5.75,0.008,fill=LINE)
        y=yb+0.02
    # right: five moves
    line(tbox(s,6.7,2.02,6.0,0.3),"Five moves",size=13.5,color=NAVY,bold=True,first=True,sa=0)
    moves=[("Set the quality standard"," — one “good NTB” definition and a minimum MOB3 penetration target above today's 22%."),
           ("Gate & measure by channel, campaign, vintage"," — funded / qualified / activated by source, not blended."),
           ("Reallocate the mix"," — scale AOC-type quality, redesign UAE / SGH channels, stop persistently dilutive spend."),
           ("Build hero pathways"," — a product-hook journey per source (TD, international, mortgage, card-only)."),
           ("Cockpit & governance"," — review early-life KPIs monthly; scale what converts, kill what doesn't.")]
    y=2.45
    for i,(head,rest) in enumerate(moves,1):
        b=shp(s,MSO_SHAPE.ROUNDED_RECTANGLE,6.7,y,0.38,0.38,fill=NTB,radius=0.22)
        b.text_frame.vertical_anchor=MSO_ANCHOR.MIDDLE
        line(b.text_frame,str(i),size=12.5,color=WHITE,bold=True,align=CENTER,first=True,sa=0)
        runs(tbox(s,7.26,y+0.0,5.44,0.62),[(head,10.5,NAVY,True),(rest,10.5,MUTED,False)],first=True,sa=0,ls=1.12)
        y+=0.57
    # full-width cockpit KPI strip
    line(tbox(s,0.6,5.05,11,0.3),"Acquisition cockpit — early-life KPIs to steer",size=12.5,color=NAVY,bold=True,first=True,sa=0)
    kpis=[("Funded rate","≤ X days"),("TRB-qualified @MOB3","~38% → lift"),
          ("Wealth pen. @MOB3","22% → 36%"),("NNIA / acquired cust.","baseline → target"),
          ("Qualified @MOB12","baseline → target")]
    x=0.6; w=2.3
    for t,v in kpis:
        card(s,x,5.4,w,0.72,accent=NTB)
        tf=tbox(s,x+0.14,5.52,w-0.26,0.5)
        line(tf,t,size=10,color=NAVY,bold=True,first=True,sa=3)
        line(tf,v,size=11,color=NTB,bold=True,sa=0)
        x+=2.45
    headline(s,0.6,6.36,12.1,0.66,
        "Closing the new-cohort gap — 22% → 36% wealth penetration @MOB3 — across a +9.6% CAGR inflow to 2.86m customers is the single largest lever on the 7.2pp gap to 50%.",size=12.5)
    foot(s,2)

page1(); page2()
out=os.path.join(HERE,"Acquisition-Strategy.pptx")
prs.save(out)
print("saved",out,"slides:",len(prs.slides._sldIdLst))
