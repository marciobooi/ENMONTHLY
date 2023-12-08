/*
Definition, mapping and handling of Eurobase codes
*/

geoCountries = {
	"EU27_2020":"",
	"EA19":"",
	"BE": "",
	"BG": "",
	"CZ": "",
	"DK": "",
	"DE": "",
	"EE": "",
	"IE": "",
	"EL": "",
	"ES": "",
	"FR": "",
	"HR": "",
	"IT": "",
	"CY": "",
	"LV": "",
	"LT": "",
	"LU": "",
	"HU": "",
	"MT": "",
	"NL": "",
	"AT": "",
	"PL": "",
	"PT": "",
	"RO": "",
	"SI": "",
	"SK": "",
	"FI": "",
	"SE": "",	
	"IS": "",
	"NO": "",
	"LI": "",
	"ME": "",
	"MK": "",
	"AL": "",
	"RS": "",
	"TR": "",
	"BA": "",
	"XK": "",
	"MD": "",
	"UA": ""
};

selectnrg = {
	"IPRD":"","IMP":"","EXP":"","PRD":"","Net_imp":"","GID_CAL":"","TO_RPI_RO":"","STK_CHG_MG":"","IC_CAL_MG":"","DL":"","AIM":"","rw":"","Nrw":"","NEG":"",
	
}
unit = {
	"THS_T":"","MIO_M3":"","TJ_GCV":"","GWH":"",
	"VOL_THS_BBL":"", "AVGPRC_USD_BBL":"", "AVGPRC_USD_T":"", "WT_THS_T":"",
}
selectsiec = {
	"TOTAL":"","C0100":"", "C0200":"", "C0311":"", "P1100":"","S2000":"","O4640":"", "O4652":"", "O4661":"", "O4671":"","O4630":"","O4680":"",
	"G3000":"","E7000":"","C0000":"", "O4000XBIO":"", "N9000":"","RA100":"", "RA200":"", "RA300":"", "RA400":"","RA500_5160":"",
	"O4000":"","O4100_TOT_4200-4500":"","O4600":"",

}

selectindic_nrg = {"nrg_cb_cosm":"",}

selectChart = {
	"nrg_cb_sffm":"","nrg_cb_oilm":"","nrg_cb_gasm":"","nrg_cb_em":"","nrg_cb_pem":"","nrg_cb_pem_RW":"",
	// "nrg_cb_cosm":"",
}

colors = ['#A5C8E4', '#5DA5DA', '#FAA43A', '#60BD68', '#F17CB0', '#B2912F', '#B276B2', '#DECF3F', '#F15854']

codesEnmonthly = {		
	"time": [],
	"geo":Object.keys(geoCountries),	
	"nrg_bal":Object.keys(selectnrg),	
	"indic_nrg":Object.keys(selectindic_nrg),	
	"unit":Object.keys(unit),	
	"siec":Object.keys(selectsiec),	
	"chart":Object.keys(selectChart),	
};

codesDataset = {
	"nrg_cb_sffm": {		
		"nrg_bal": ["IPRD","IMP","EXP","Net_imp","GID_CAL",], 
		"siec": ["C0100", "C0200", "C0311", "P1100","S2000"], 
		"unit": ["THS_T"], 
		"defaultSiec": ["C0100"], 
		"defaultNrg_bal": ["IPRD"], 
		"defaultUnit": ["THS_T"], 
	},
	"nrg_cb_oilm": {		
		"nrg_bal": ["TO_RPI_RO ","IMP","EXP","Net_imp","GID_CAL",], 
		"siec": ["O4640", "O4652", "O4661", "O4671","O4630","O4680"], 
		"unit": ["THS_T"], 
		"defaultSiec": ["O4640"], 
		"defaultNrg_bal": ["TO_RPI_RO"], 
		"defaultUnit": ["THS_T"], 
	},
	"nrg_cb_cosm": {		
		"nrg_bal": ["IMP","PRD"], 			
		"defaultNrg_bal": ["IMP"], 	
		"unit": ["VOL_THS_BBL", "AVGPRC_USD_BBL", "AVGPRC_USD_T", "WT_THS_T"],
		"defaultUnit": ["VOL_THS_BBL"], 
		"siec": ["nrg_cb_cosm"], 
		"defaultSiec": ["nrg_cb_cosm"], 
	},
	"nrg_cb_gasm": {		
		"nrg_bal": ["IPRD","IMP","EXP","Net_imp","STK_CHG_MG","IC_CAL_MG"], 
		"siec": ["G3000"], 
		"defaultSiec": ["G3000"], 
		"defaultNrg_bal": ["IPRD"], 
		"unit": ["MIO_M3","TJ_GCV"], 
		"defaultUnit": ["TJ_GCV"], 
	},
	"nrg_cb_em": {		
		"nrg_bal": ["IMP","EXP","Net_imp","DL","AIM"], 
		"siec": ["E7000"], 
		"defaultSiec": ["E7000"], 
		"defaultNrg_bal": ["IMP"], 
		"unit": ["GWH"], 
		"defaultUnit": ["GWH"], 
	},
	"nrg_cb_pem": {			
		"nrg_bal": ["NEG"],
		"defaultNrg_bal": ["NEG"], 
		"siec": ["TOTAL", "CF","G3000","O4000XBIO","RA100","RA300","RA200","RA400","RA500_5160","N9000","X9900","C0000"], 
		"defaultSiec": ["TOTAL"], 
		"unit": ["GWH"], 
		"defaultUnit": ["GWH"], 
	},
	"nrg_cb_pem_RW": {			
		"nrg_bal": ["NEG"],
		"defaultNrg_bal": ["NEG"], 
		"siec": ["TOTAL", "CF","G3000","O4000XBIO","RA100","RA300","RA200","RA400","RA500_5160","N9000","X9900","C0000"], 
		"defaultSiec": ["TOTAL"], 
		"unit": ["GWH"], 
		"defaultUnit": ["GWH"], 
	},
	"nrg_stk_oilm": {	
		"nrg_bal": ["STK_FLOW","STKCL_EUE","STKCL_NAT"], 		
		"siec": ["O4000","O4100_TOT_4200-4500","O4600"], 
		"defaultSiec": ["O4000"], 
		"defaultNrg_bal": ["STK_FLOW"], 
		"unit": ["GWH"], 
		"defaultUnit": ["GWH"], 
	},
};



var Nrw = ["C0000","G3000","O4000XBIO","N9000"]
var rw = ["RA100","RA200","RA300","RA400","RA500_5160"]

defGeos = ["EU27_2020","BE","BG","CZ","DK","DE","EE","IE","EL","ES","FR","HR","IT","CY","LV","LT","LU","HU","MT","NL","AT","PL","PT","RO","SI","SK","FI","SE","IS","LI","NO","ME","MK","AL","RS","TR","BA","XK","MD","UA","GE"]

