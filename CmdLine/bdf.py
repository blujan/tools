'''
MIT License

Copyright (c) 2015 Brennan Lujan

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
'''

import argparse
from Tkinter import Tk

pciexbar = 0xe0000000

def BDF(bus, device, function):
    value = "0x%08X" % (pciexbar | bus << 20 | device << 15 | function << 12)
    print value
    c = Tk()
    c.withdraw()
    c.clipboard_clear()
    c.clipboard_append(value)
    c.destroy()


if __name__ == '__main__':
    parser = argparse.ArgumentParser(formatter_class=argparse.RawTextHelpFormatter)
    parser.add_argument('bus', metavar='B', help="Bus")
    parser.add_argument('device',  metavar='D', help="Device")
    parser.add_argument('function', metavar='F', help="Function")
    args = parser.parse_args()
    arglist = [args.bus, args.device, args.function]
    arglist2 = []
    for item in arglist:
        if item.startswith("0x"):
            arglist2.append(int(item, 16))
        else:
            arglist2.append(int(item))
    BDF (arglist2[0], arglist2[1], arglist2[2])

