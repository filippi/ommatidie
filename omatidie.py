#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Tue Jun 21 15:01:24 2022

@author: filippi_j
"""

import pandas as pd

df = pd.read_csv (r'/Users/filippi_j/data/2022/omatidie/full2021.csv')
print (df)
for col in df.columns:
    print(col)
dc = pd.concat((df[(df["code_departement"] == "2A")],df[(df["code_departement"] == "2B")]))

dc["valeur_fonciere"] = dc["valeur_fonciere"] /(1000*dc["surface_reelle_bati"])


dextract = dc[["latitude","longitude","valeur_fonciere"]]
dextract = dextract[(dextract["valeur_fonciere"] > 0.5)]
dextract = dextract[(dextract["valeur_fonciere"] < 50)]

dextract.to_csv('/Users/filippi_j/Documents/workspace/jsPlayground/Ommatidie/scatterSetFoncier.csv')  