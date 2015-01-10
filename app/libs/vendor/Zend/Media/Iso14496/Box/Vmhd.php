<?php
/**
 * Zend Framework
 *
 * LICENSE
 *
 * This source file is subject to the new BSD license that is bundled
 * with this package in the file LICENSE.txt.
 * It is also available through the world-wide-web at this URL:
 * http://framework.zend.com/license/new-bsd
 * If you did not receive a copy of the license and are unable to
 * obtain it through the world-wide-web, please send an email
 * to license@zend.com so we can send you a copy immediately.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 'AS IS'
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 *
 * @category   Zend
 * @package    Zend_Media
 * @subpackage ISO14496
 * @copyright  Copyright (c) 2005-2009 Zend Technologies USA Inc. (http://www.zend.com) 
 * @license    http://framework.zend.com/license/new-bsd     New BSD License
 * @version    $Id: Vmhd.php 177 2010-03-09 13:13:34Z svollbehr $
 */

/**#@+ @ignore */
require_once 'Zend/Media/Iso14496/FullBox.php';
/**#@-*/

/**
 * The <i>Video Media Header Box</i> contains general presentation information,
 * independent of the coding, for video media.
 *
 * @category   Zend
 * @package    Zend_Media
 * @subpackage ISO14496
 * @author     Sven Vollbehr <sven@vollbehr.eu>
 * @copyright  Copyright (c) 2005-2009 Zend Technologies USA Inc. (http://www.zend.com) 
 * @license    http://framework.zend.com/license/new-bsd     New BSD License
 * @version    $Id: Vmhd.php 177 2010-03-09 13:13:34Z svollbehr $
 */
final class Zend_Media_Iso14496_Box_Vmhd extends Zend_Media_Iso14496_FullBox
{
    /** @var integer */
    private $_graphicsMode = 0;

    /** @var Array */
    private $_opcolor = array(0, 0, 0);

    /**
     * Constructs the class with given parameters and reads box related data
     * from the ISO Base Media file.
     *
     * @param Zend_Io_Reader $reader  The reader object.
     * @param Array          $options The options array.
     */
    public function __construct($reader = null, &$options = array())
    {
        parent::__construct($reader, $options);

        if ($reader === null) {
            $this->setFlags(1);
            return;
        }

        $this->_graphicsMode = $this->_reader->readUInt16BE();
        $this->_opcolor = array
                ($this->_reader->readUInt16BE(),
                 $this->_reader->readUInt16BE(),
                 $this->_reader->readUInt16BE());
    }

    /**
     * Returns the composition mode for this video track, from the following
     * enumerated set, which may be extended by derived specifications:
     *
     * <ul>
     * <li>copy = 0 copy over the existing image</li>
     * </ul>
     *
     * @return integer
     */
    public function getGraphicsMode()
    {
        return $this->_graphicsMode;
    }

    /**
     * Sets the composition mode for this video track.
     *
     * @param integer $graphicsMode The composition mode.
     */
    public function setGraphicsMode($graphicsMode)
    {
        $this->_graphicsMode = $graphicsMode;
    }

    /**
     * Returns an array of 3 colour values (red, green, blue) available for use
     * by graphics modes.
     *
     * @return Array
     */
    public function getOpcolor()
    {
        return $this->_opcolor;
    }

    /**
     * Sets the array of 3 colour values (red, green, blue) available for use
     * by graphics modes.
     *
     * @param Array $opcolor An array of 3 colour values
     */
    public function setOpcolor($opcolor)
    {
        $this->_opcolor = $opcolor;
    }

    /**
     * Returns the box heap size in bytes.
     *
     * @return integer
     */
    public function getHeapSize()
    {
        return parent::getHeapSize() + 8;
    }

    /**
     * Writes the box data.
     *
     * @param Zend_Io_Writer $writer The writer object.
     * @return void
     */
    protected function _writeData($writer)
    {
        parent::_writeData($writer);
        $writer->writeUInt16BE($this->_graphicsMode)
               ->writeUInt16BE($this->_opcolor[0])
               ->writeUInt16BE($this->_opcolor[1])
               ->writeUInt16BE($this->_opcolor[2]);
    }
}
