<template>
    <div :style="containerStyle" class="multiselect">
        <p v-show="false"> {{ currItem }}</p>
        <div class="multi-selection-container" :style="inputStyle" @click="keyCapture($event)" v-if="multiple">
            <ul class="choice-list">
                <li class="choice" v-for="data in selectedValues" :key="data.label"> 
					{{ data[label] }} 
					<span class="close" @click="clearItem($event, data)">&times;</span>
				</li>
                <li class="choice">
                    <input type="text" class="search" ref="listSearch" v-model="keywords" @focus="onFocus" @keydown="keyMonitor"></input>
                </li>
            </ul>
        </div>
		<div class="single-selection-container" v-if="!multiple" @click="atSelectClick">
            {{ selectedValue.label }}
			<v-icon :name="iconName" :style="iconStyle"/>
		</div>
        <ul v-show="showLabels" class="selection-labels" id="labels" :style="labelStyle">
            <li class="selection-choice" @keyup="navOnLabel" @keypress="enterPress" v-for="(data, index) in filteredOptions" :key="data.name" :class="{navColor: data.navigate, selected: data.selected}" @click="onLabelClick(data, index)"> {{ data.label }} </li>
        </ul>
    </div>
</template>

<script>
import Icon from 'vue-awesome/components/Icon'
import 'vue-awesome/icons/sort-up'
import 'vue-awesome/icons/sort-down'
export default {
	name: 'MultiSelect',
	data() {
		return {
			showLabels: false,
			keywords: '',
			currItem: 1,
			divHeight: 0,
			selectedValue: this.sValue,
			iconName: 'sort-down'
		}
	},
	components: {
		'v-icon': Icon
	},
	props: {
		options: {
			type: [Object, Array],
			required: true
		},
		multiple: {
			type: Boolean,
			required: true
		},
		trackBy: {
			type: String,
			required: false
		},
		width: {
			type: [Number, String],
			required: false
		},
		label: {
			type: String,
			required: false
		},
		selectedValues: {
			type: [Object, Array],
			required: false
		},
		sValue: {
			type: [Object, Array, String],
			required: false
		},
		placeHolder: {
			type: String,
			required: false
		}
	},
	beforeMount () {
		this.options.map((item, index) => {
			item.navigate = false
			item.itemId = index + 1
			if (this.selectedValues.map(val => val.name).indexOf(item.name) > -1) {
				item.selected = true
			} else {
				item.selected = false
			}
		})
	},
	created () {
		this.heightChange()
	},
	updated () {
		this.heightChange()
	},
	mounted () {
		document.addEventListener("keyup", this.navOnLabel)
		document.addEventListener("keypress", this.enterPress)
		window.addEventListener("click", this.checkElement)
	},
	destroyed () {
		document.removeEventListener("keyup", this.navOnLabel)
		document.removeEventListener("keypress", this.enterPress)
		window.removeEventListener("click", this.checkElement)
	},
	methods: {
		checkElement (event) {
			if (document.getElementsByClassName('multiselect')[0].contains(event.target)) {
				this.showLabels = true
			} else {
				this.showLabels = false
				this.iconName = 'sort-down'
			}
		},
		atSelectClick () {
			this.iconName = 'sort-up'
			this.showLabels = true
		},
		keyMonitor (event) {
			let evtkey = event.keyCode
			if ((evtkey >= 48 && evtkey <= 57) || (evtkey >= 65 && evtkey <= 90) || (evtkey >= 97 && evtkey <= 122) || (evtkey == 8)) {
				if (this.keywords.length <= 0 && evtkey == 8 && this.selectedValues.length > 0) {
					for (var key in this.filteredOptions) {
						if (this.filteredOptions[key][this.trackBy].indexOf(this.selectedValues[this.selectedValues.length -1][this.trackBy]) > -1) {
							this.selectedValues.splice((this.selectedValues.length-1), 1)
							this.filteredOptions[key].selected = !this.filteredOptions[key].selected
							break
						}
					}
				}
				this.$nextTick(() => {
					this.keywords = event.target.value
					this.currItem = 1
				})
			}
		},
		heightChange () {
			let str = this.selectedValues.join()
			this.divHeight = (Math.ceil((str.length+1) / 45)) * 40
		},
		keyCapture (event) {
			this.$nextTick(() => {
				this.$refs.listSearch.focus()
			})
		},
		clearItem (event, selectedItem) {
			// Deselects or removes the element from the multi-select div when clicking the close button...
			this.filteredOptions.map((item, index) => {
				if (item[this.trackBy].indexOf(selectedItem[this.trackBy]) > -1) {
					this.selectedValues.splice(this.selectedValues.map(sVal => sVal[this.trackBy]).indexOf(selectedItem[this.trackBy]), 1)
					item.selected = !item.selected
				}
			})
		},
		onFocus () {
			this.showLabels = true
		},
		onLabelClick (data, index) {
			// Selects or append the elements to the multi-select div when clicking on the list elements...
			if (this.multiple) {
				data.selected = !data.selected
				// this.showLabels = true
				this.keywords = ''
				this.filteredOptions.map(item => {
					if (item[this.trackBy].toLowerCase().indexOf(data[this.trackBy].toLowerCase()) > -1 && item.selected == true) {
						let sValue = {}
						sValue[this.trackBy] = item[this.trackBy]
						sValue[this.label] = item[this.label]
						this.selectedValues.push(sValue)
					} else if (item[this.trackBy].toLowerCase().indexOf(data[this.trackBy].toLowerCase()) > -1 && item.selected == false) {
						this.selectedValues.splice(this.selectedValues.map(sVal => sVal[this.trackBy]).indexOf(data[this.trackBy]), 1)
					}
				})
			} else {
				data.selected = true
				this.$nextTick(() => {
					this.showLabels = false
				})
				this.iconName = 'sort-down'
				this.filteredOptions.forEach(item => {
					if (item.name == data.name) {
						let sValue = {}
						sValue.label = item.label
						sValue.name = item.name
						this.selectedValue = sValue
						this.$emit('clicked', sValue)
					} else {
						item.selected = false
					}
				})
			}
		},
		navOnLabel () {
			// No navigation for single select..
			if (!this.multiple) {
				return
			}
			// Naviate through label items on key up & down 
			let getLabel = document.getElementById('labels')
			if (event.keyCode == 38) {
				if (this.currItem !== 1) {
					this.currItem--
					getLabel.scrollBy(0, -20)
				} else {
					this.currItem = this.currItem + this.filteredOptions.length-1
					getLabel.scrollBy(0, (20*this.filteredOptions.length-1))
				}
			} else if (event.keyCode == 40) {
				if (this.currItem !== this.filteredOptions.length) {
					this.currItem++
					getLabel.scrollBy(0, 20)
				} else {
					this.currItem = this.currItem - (this.filteredOptions.length-1)
					getLabel.scrollBy(0, (-20*this.filteredOptions.length-1))
				}
			}
			this.filteredOptions.map((item, index) => {
				if (item[this.trackBy] == this.filteredOptions[this.currItem-1][this.trackBy]) {
					item.navigate = true
				} else {
					item.navigate = false
				}
			})
		},
		enterPress () {
			// No enter key press for single select..
			if (!this.multiple) {
				return
			}
			// Select & Deselect Labels on keypress Enter  
			if (event.keyCode == 13) {
				var filteredCurrentOption = this.filteredOptions[this.currItem - 1]
				if (filteredCurrentOption.selected == false) {
					let sValue = {}
					filteredCurrentOption.selected = true
					sValue[this.trackBy] = filteredCurrentOption[this.trackBy]
					sValue[this.label] = filteredCurrentOption[this.label]
					this.selectedValues.push(sValue)
					this.keywords = ''
					// this.currItem = 1
				} else {
					this.selectedValues.splice(this.selectedValues.map(sVal => sVal[this.trackBy]).indexOf(filteredCurrentOption[this.trackBy]), 1)
					filteredCurrentOption.selected = false
				}
			}
		}
	},
	computed: {
		// Filter Lists based upon search 
		filteredOptions () {
			return this.options.filter(item => {
				return item.label.toLowerCase().indexOf(this.keywords.toLowerCase()) > -1
			})
		},
		// Conditional style rendering
		containerStyle () {
			return { width: (this.width !== undefined ? this.width+'px': '300px') }
		},
		inputStyle () {
			return { height: this.divHeight+'px' }
		},
		iconStyle () {
			return { left: '350px', position: 'absolute', top: (this.showLabels) ? '22px' : '18px' }
		},
		labelStyle () {
			return { position: 'absolute', width: (this.width !== undefined ? this.width+'px': '300px') }
		}
	}
}
</script>

<style>
.multi-selection-container {
  border: 1px solid #CCC;
  width: 100%;
}
.single-selection-container {
  border: 1px solid #CCC;
  width: 100%;
  height: 40px;
  line-height: 40px;
  padding-left: 10px;
  color: #827e7e;
}
#inputDivSS {
  border: 1px solid #CCC;
  height: 40px;
  width: 100%;
}
.selected {
  background: #41c69e;
}
.navColor {
  color: #c0f0e1;
}
ul.choice-list {
  list-style-type: none;
  padding: 0;
  display: inline-block;
  margin: 5px 0; 
}
ul.selection-labels {
  list-style-type: none;
  padding: 0;
  border: 1px solid #CCC;
  background-color: #FFF;
  display: inline-block;
  max-height: 100px;
  overflow-y: auto;
}
li.selection-choice {
  padding: 4px;
  text-align: left;
  position: relative;
}
li.choice {
  cursor: pointer;
  float: left;
  display: inline-block;
  border: 1px solid #CCC;
  border-radius: 2px;
  padding-left: 4px;
  padding-top: 4px;
  padding-bottom: 4px;
  padding-right: 14px;
  margin-left: 5px;
  margin-bottom: 4px;
  display: block;
  position: relative;
}
li.choice:last-child {border: 0;}
a {color: #42b983;}
.close {
  cursor: pointer;
  position: absolute;
  top: 50%;
  right: 0%;
  transform: translate(0%, -50%);
}
.close:hover {background: #bbb;}
input.search {
	border: 0;
	width: 65px;
}
input.search:focus{
  outline: none;
}
</style>