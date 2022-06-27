#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Tue Jun 21 15:01:24 2022

@author: Roberta Baggio, J.B. Filippi, Damien Grandi
Challenge Dataviz 28/06/2022  Equipe Omatidie


"""

import pandas as pd
from netCDF4 import Dataset
import numpy as np
import math
import matplotlib.pyplot as plt
refProjectionFile = "/Users/filippi_j/data/2022/firecaster_surface_data/refProjection.nc"

def loadFromOpenDataCorsica():
    print("Chargement des données sur Opendata.Corsica")
    dtt = pd.read_csv ("https://www.data.corsica/explore/dataset/demande-de-valeurs-foncieres-geolocalisee/download/?format=csv&timezone=Europe/Paris&lang=fr&use_labels_for_header=true&csv_separator=%3B", sep=";")
    dtt.columns = dtt.columns.str.replace(' ','_')
    dtt.columns = dtt.columns.str.lower()
    dtt.columns = dtt.columns.str.replace(r'[èéêë]', 'e')
    dtt.columns = dtt.columns.str.replace(r'[àâ]', 'a')
    dtt.code_insee_de_la_commune=dtt.code_insee_de_la_commune.astype("str")
    dtt["SURF"]=dtt.surface_reelle_du_bati
    dtt.surface_carrez_du_lot_1=dtt.surface_carrez_du_lot_1.where(dtt.surface_carrez_du_lot_1.notna(),0)
    dtt.surface_carrez_du_lot_2=dtt.surface_carrez_du_lot_2.where(dtt.surface_carrez_du_lot_2.notna(),0)
    dtt.surface_carrez_du_lot_3=dtt.surface_carrez_du_lot_3.where(dtt.surface_carrez_du_lot_3.notna(),0)
    dtt.surface_carrez_du_lot_4=dtt.surface_carrez_du_lot_4.where(dtt.surface_carrez_du_lot_4.notna(),0)
    dtt.lot5_surface_carrez=dtt.surface_carrez_du_lot_4.where(dtt.surface_carrez_du_lot_4.notna(),0)
    
    dtt.SURF=dtt.SURF.where(dtt.SURF>=dtt.surface_carrez_du_lot_1+dtt.surface_carrez_du_lot_2+dtt.surface_carrez_du_lot_3+dtt.surface_carrez_du_lot_4+dtt.lot5_surface_carrez,dtt.surface_carrez_du_lot_1+dtt.surface_carrez_du_lot_2+dtt.surface_carrez_du_lot_3+dtt.surface_carrez_du_lot_4+dtt.lot5_surface_carrez)
    dtt.SURF=dtt.SURF.where(dtt.SURF.notna(),dtt.surface_du_terrain)
    dtt.SURF=dtt.SURF.where(dtt.SURF!=0,dtt.surface_du_terrain)
    dtt=dtt[dtt.SURF>=20]
    dtt["PRIX_m2"]=dtt.valeur_fonciere/dtt.SURF
        
    return dtt

def locationtoCSV(slat,slng,size,patheout):
    buffer = size
    fcdf = Dataset(refProjectionFile, 'r')
    
    lngs = np.array(fcdf.variables["lng"][:])
    lats = np.array(fcdf.variables["lat"][:])
    altitude = np.array(fcdf.variables["ZS"][:])
    
    ni, nj = np.shape(lngs)
    distances = {}
    LatLonStr = "%f,%f"%(slat,slng) 
    print(LatLonStr)
    for i in range(ni):
        for j in range(nj):
            dist = int(100000 * math.sqrt((slat-lats[i, j])**2+(slng-lngs[i, j])**2))
            distances[dist] = (i, j)

    nearest = distances[sorted(distances.keys())[0]]
    
    z = altitude[nearest[0]-buffer:nearest[0]+buffer, nearest[1]-buffer:nearest[1]+buffer]
    lon= lngs[nearest[0]-buffer:nearest[0]+buffer, nearest[1]-buffer:nearest[1]+buffer]
    lat = lats[nearest[0]-buffer:nearest[0]+buffer, nearest[1]-buffer:nearest[1]+buffer]
        
    pd.DataFrame(z).to_csv(patheout)
    
    return z, lat,lon
#ajouter une colonne région + 1 colonne semestre

#precomputed=False

#df = {}
#if precomputed:
#    df = pd.read_csv (r'scatterSetFoncierMOD.csv')
#else:
#    df =  loadFromOpenDataCorsica()

def compiledata():
    df['date_de_la_mutation'] = pd.to_datetime(df['date_de_la_mutation'])
    dextract = df[["latitude","longitude","PRIX_m2","date_de_la_mutation","valeur_fonciere","SURF",]]
    dextract.to_csv('/Users/filippi_j/Documents/workspace/jsPlayground/Ommatidie/scatterSetFoncier2.csv')  

areas = {}
areas["ajaccio"] = (41.9189, 8.7924)
for area in areas.keys():
        z,la,lo = locationtoCSV(areas[area][0], areas[area][1],25,"%s.csv"%area)
        plt.matshow(z)
        plt.show()