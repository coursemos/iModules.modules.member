<?php
/**
 * 이 파일은 아이모듈 회원모듈의 일부입니다. (https://www.imodules.io)
 *
 * 회원모듈 클래스 정의한다.
 *
 * @file /modules/member/Member.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 4. 10.
 */
namespace modules\member;
class Member extends \Module
{
    /**
     * @var Member[] $_members 회원정보
     */
    private static array $_members;

    /**
     * 모듈을 설정을 초기화한다.
     */
    public function init(): void
    {
        /**
         * 모듈 라우터를 초기화한다.
         */
        \Router::add('/members/{member_id}/{type}', '#', 'blob', [$this, 'doRoute']);
    }

    /**
     * 현재 로그인중인 회원고유번호를 가져온다.
     *
     * @return int $member_id 회원고유값, 로그인되어 있지 않은 경우 0
     */
    public function getLogged(): int
    {
        return 0; //$this->logged == null ? 0 : $this->logged->idx;
    }

    /**
     * 현재 사용자가 로그인중인지 확인한다.
     *
     * @return bool $is_logged
     */
    function isLogged(): bool
    {
        // todo: 로그인 처리
        return false;
    }

    /**
     * 회원정보를 가져온다.
     *
     * @return dto\Member $member
     */
    public function getMember(int $member_id = 0): dto\Member
    {
        if ($member_id != 0 && isset(self::$_members[$member_id]) == true) {
            return self::$_members[$member_id];
        }

        if ($member_id == 0) {
            return new dto\Member();
        }

        $member = $this->db()
            ->select()
            ->from($this->table('members'))
            ->where('member_id', $member_id)
            ->getOne();

        self::$_members[$member_id] = new dto\Member($member);
        return self::$_members[$member_id];
    }

    /**
     * 회원관련 이미지 라우팅을 처리한다.
     *
     * @param Route $route 현재경로
     * @param int $member_id 회원고유값
     * @param string $type 이미지종류
     */
    public function doRoute(\Route $route, string $member_id, string $type): void
    {
        $temp = explode('.', $type);
        $type = $temp[0];
        $extension = $temp[1];

        if (in_array($type, ['photo', 'nickcon']) === false) {
            \ErrorHandler::print($this->error('NOT_FOUND_FILE', $route->getUrl()));
        }

        if (is_file(\Configs::attachment() . '/member/' . $type . '/' . $member_id . '.' . $extension) == true) {
            $path = \Configs::attachment() . '/member/' . $type . '/' . $member_id . '.' . $extension;
        } else {
            $path = $this->getPath() . '/images/' . $type . '.' . $extension;
        }

        session_write_close();

        header('Content-Type: images/' . $extension);
        header('Content-Length: ' . filesize($path));
        header('Expires: ' . gmdate('D, d M Y H:i:s', time() + 3600) . ' GMT');
        header('Cache-Control: max-age=3600');
        header('Pragma: public');

        readfile($path);
        exit();
    }
}
